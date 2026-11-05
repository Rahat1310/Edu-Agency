import { sql, eq } from "drizzle-orm";
import { db } from "@/db";
import { assessmentOutbox, leads, counselorProfiles } from "@/db/schema";
import { sendTransactionalEmail } from "@/lib/email/send";
import { sendWhatsAppMessage, WhatsAppRequestError } from "@/lib/whatsapp/send";

import { escapeHtml } from "./email-html";

export async function processAssessmentOutbox(
  filter: { leadId?: string; channel?: "email" | "whatsapp" } = {},
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
      if (job.channel === "email") {
        if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
          await save(
            "configuration_required",
            "Configure RESEND_API_KEY and verified EMAIL_FROM",
          );
          continue;
        }
        const sections = [
          [
            "Personal information",
            {
              name: a.name,
              dob: a.dob,
              age: a.age,
              location: a.location,
              passport: a.passport,
            },
          ],
          [
            "Contact information",
            { phone: a.phone, whatsapp: a.whatsapp, email: a.email },
          ],
          [
            "Academic background",
            {
              sscGrade: a.sscGrade,
              sscYear: a.sscYear,
              hscStatus: a.hscStatus,
              hscGrade: a.hscGrade,
              hscYear: a.hscYear,
              bachelorGrade: a.bachelorGrade,
              bachelorYear: a.bachelorYear,
              institution: a.institution,
              lastDegree: a.lastDegree,
              lastSubject: a.lastSubject,
              previousDegreeResult: a.previousDegreeResult,
              previousDegreeYear: a.previousDegreeYear,
              studyGap: a.studyGap,
              gapDuration: a.gapDuration,
              gapExplanation: a.gapExplanation,
            },
          ],
          [
            "Study plan",
            {
              country: a.country,
              degree: a.degree,
              subject: a.subject,
              intake: a.intakeUnsure ? "Not Sure Yet" : a.intake,
            },
          ],
          [
            "Language and other information",
            {
              languages: a.languages,
              hskLevel: a.hskLevel,
              hskScore: a.hskScore,
              publications: a.publications,
              publicationCount: a.publicationCount,
              publicationDetails: a.publicationDetails,
              recommendations: a.recommendations,
            },
          ],
          [
            "Assignment and source",
            {
              counselor: c?.fullName ?? "Pending assignment",
              counselorTitle: c?.title,
              counselorPhone: c?.phone,
              counselorWhatsApp: c?.whatsapp,
              source: lead.source,
              campaign: a.attribution,
              consentVersion: lead.consentVersion,
              consentAt: lead.consentAt?.toISOString(),
            },
          ],
        ];
        const text =
          `NEW STUDENT ASSESSMENT | ${lead.reference}\nSubmitted: ${lead.createdAt?.toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })} (Asia/Dhaka)\n\n` +
          sections
            .map(
              ([title, values]) =>
                `${title}\n${Object.entries(values as object)
                  .map(
                    ([k, v]) =>
                      `${k}: ${typeof v === "object" ? JSON.stringify(v) : v || "—"}`,
                  )
                  .join("\n")}`,
            )
            .join("\n\n") +
          `\n\nPrivate assessment: ${link}`;
        const result = await sendTransactionalEmail({
          to: "support@studyabroadconsultantbd.com",
          subject: `New Student Assessment | ${lead.reference} | ${a.country}`,
          text,
          html: `<div style="font-family:Arial,sans-serif;max-width:760px;color:#102b4e"><h1>New Student Assessment</h1><pre style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.7">${escapeHtml(text)}</pre></div>`,
          idempotencyKey: `assessment-${id}`,
        });
        await save(
          result.dryRun ? "configuration_required" : "accepted",
          null,
          result.id,
        );
      } else {
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
      }
    } catch (error) {
      // Never persist provider error bodies which can echo student details or credentials.
      await save(
        Number(job.attempts) >= 5
          ? "failed"
          : job.channel === "whatsapp" &&
              !(error instanceof WhatsAppRequestError && error.status === 429)
            ? "review_required"
            : "retry",
        "Provider request failed; inspect provider dashboard. WhatsApp requires acceptance verification before retry.",
      );
    }
  }
  return { processed: jobs.rows.length };
}
