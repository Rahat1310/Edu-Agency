import { sql, eq } from "drizzle-orm";
import { db } from "@/db";
import { assessmentOutbox, leads, counselorProfiles } from "@/db/schema";
import {
  sendTransactionalEmail,
  EmailAcceptanceUncertainError,
} from "@/lib/email/send";
import { isEmailConfigured } from "@/lib/email/config";
import { sendWhatsAppMessage, WhatsAppRequestError } from "@/lib/whatsapp/send";

import { buildStaffAssessmentEmail } from "./staff-email";
import { buildAssessmentReceipt } from "./receipt";
import { defaultCounsellor } from "./counsellor";

export async function processAssessmentOutbox(
  filter: {
    leadId?: string;
    channel?: "email" | "student_email" | "whatsapp";
  } = {},
) {
  const scope = sql`${filter.leadId ? sql`AND lead_id=${filter.leadId}::uuid` : sql``}
    ${filter.channel ? sql`AND channel=${filter.channel}` : sql``}`;
  // Atomic leases prevent concurrent workers taking the same job. Uncertain WhatsApp sends require manual review, since Meta has no send idempotency key.
  await db.execute(
    sql`UPDATE assessment_outbox SET status='review_required', error='Worker interrupted; verify provider acceptance before retry' WHERE status='processing' AND updated_at < now() - interval '10 minutes' ${scope}`,
  );
  const jobs =
    await db.execute(sql`UPDATE assessment_outbox SET status='processing', attempts=attempts+1, updated_at=now()
    WHERE id IN (SELECT id FROM assessment_outbox WHERE status IN ('pending','retry','configuration_required') AND next_attempt_at <= now() ${scope} ORDER BY next_attempt_at FOR UPDATE SKIP LOCKED LIMIT 5) RETURNING id,lead_id,channel,attempts`);
  for (const job of jobs.rows) {
    const id = String(job.id);
    const save = async (
      status: string,
      error: string | null,
      providerId: string | null = null,
    ) =>
      db
        .update(assessmentOutbox)
        .set({
          status,
          error,
          providerId,
          attempts:
            status === "configuration_required"
              ? Math.max(0, Number(job.attempts) - 1)
              : Number(job.attempts),
          updatedAt: new Date(),
          nextAttemptAt: new Date(
            Date.now() +
              (status === "configuration_required"
                ? 3600000
                : Math.min(86400000, 60000 * 2 ** Number(job.attempts))),
          ),
        })
        .where(eq(assessmentOutbox.id, id));
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, String(job.lead_id)));
    if (!lead?.assessment) {
      await save("failed", "Assessment unavailable");
      continue;
    }
    const [profile] = lead.assignedCounselorId
      ? await db
          .select()
          .from(counselorProfiles)
          .where(eq(counselorProfiles.id, lead.assignedCounselorId))
      : [];
    const a = lead.assessment;
    const c = profile ?? a.assignedCounselor;
    const origin = process.env.NEXT_PUBLIC_APP_URL;
    if (
      !origin ||
      (process.env.NODE_ENV === "production" && !origin.startsWith("https://"))
    ) {
      await save(
        "configuration_required",
        "Configure HTTPS NEXT_PUBLIC_APP_URL",
      );
      continue;
    }
    const link = `${origin.replace(/\/$/, "")}/admin/leads/${lead.id}`;
    try {
      if (job.channel === "email" || job.channel === "student_email") {
        if (!isEmailConfigured()) {
          await save(
            "configuration_required",
            "Configure BREVO_API_KEY (or RESEND_API_KEY) and verified EMAIL_FROM",
          );
          continue;
        }
        if (job.channel === "student_email") {
          if (!a.email) {
            await save("failed", "Student email unavailable");
            continue;
          }
          const contact = a.assignedCounselor ?? c ?? null;
          const receipt = buildAssessmentReceipt(
            {
              reference: lead.reference!,
              firstName: a.name.split(" ")[0] ?? a.name,
              counselor: contact,
            },
            contact ?? defaultCounsellor,
          );
          const result = await sendTransactionalEmail({
            to: a.email,
            ...receipt,
            idempotencyKey: `assessment-${id}`,
          });
          await save(
            result.dryRun ? "configuration_required" : "accepted",
            null,
            result.id,
          );
          continue;
        }
        const email = buildStaffAssessmentEmail({
          assessment: a,
          counselor: c,
          source: lead.source,
          consentVersion: lead.consentVersion,
          consentAt: lead.consentAt,
          reference: lead.reference!,
          submittedAt: lead.createdAt,
          privateUrl: link,
        });
        const result = await sendTransactionalEmail({
          to: "support@studyabroadconsultantbd.com",
          ...email,
          idempotencyKey: `assessment-${id}`,
        });
        await save(
          result.dryRun ? "configuration_required" : "accepted",
          null,
          result.id,
        );
      } else if (job.channel === "whatsapp") {
        if (
          ![
            "WHATSAPP_ACCESS_TOKEN",
            "WHATSAPP_PHONE_NUMBER_ID",
            "ASSESSMENT_WHATSAPP_RECIPIENT",
            "ASSESSMENT_WHATSAPP_TEMPLATE",
          ].every((k) => process.env[k]?.trim())
        ) {
          await save(
            "configuration_required",
            "Configure Meta credentials, authorised recipient and approved assessment template",
          );
          continue;
        }
        const result = await sendWhatsAppMessage({
          to: process.env.ASSESSMENT_WHATSAPP_RECIPIENT!,
          template: {
            name: process.env.ASSESSMENT_WHATSAPP_TEMPLATE!,
            language: process.env.ASSESSMENT_WHATSAPP_LANGUAGE || "en",
            bodyParameters: [
              lead.reference!,
              a.country,
              a.degree,
              c?.fullName ?? "Pending assignment",
              link,
            ],
          },
        });
        await save(
          result.dryRun ? "configuration_required" : "accepted",
          null,
          result.id,
        );
      } else {
        await save("failed", "Unknown notification channel");
      }
    } catch (error) {
      // Never persist provider error bodies which can echo student details or credentials.
      await save(
        error instanceof EmailAcceptanceUncertainError
          ? "review_required"
          : Number(job.attempts) >= 5
            ? "failed"
            : job.channel === "whatsapp" &&
                !(error instanceof WhatsAppRequestError && error.status === 429)
              ? "review_required"
              : "retry",
        "Provider request failed; inspect provider dashboard. Uncertain acceptance requires verification before retry.",
      );
    }
  }
  return { processed: jobs.rows.length };
}
