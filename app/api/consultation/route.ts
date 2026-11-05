import { createHash } from "node:crypto";
import { sql, eq, and } from "drizzle-orm";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { leads, counselorProfiles } from "@/db/schema";
import { assessmentSchema, CONSENT_VERSION } from "@/lib/consultation/schema";
import { defaultCounsellor } from "@/lib/consultation/counsellor";
import { processAssessmentOutbox } from "@/lib/consultation/notifications";
import { getRequestIp } from "@/lib/request-ip";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
export const runtime = "nodejs";
export const maxDuration = 60;
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json({ error: "Invalid request origin." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "JSON required." }, 415);
  const ip = getRequestIp(request);
  if (!(await rateLimit("lead-form", ip)).allowed)
    return json(
      { error: "Please wait before submitting another assessment." },
      429,
    );
  // Bound the body while streaming, even if Content-Length is absent or untrusted.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: "Missing assessment." }, 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 24000) {
      await reader.cancel();
      return json({ error: "Assessment is too large." }, 413);
    }
    chunks.push(value);
  }
  let raw;
  try {
    raw = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return json({ error: "Invalid assessment." }, 400);
  }
  const envelope = z
    .object({
      key: z.uuid(),
      website: z.string().max(200).optional(),
      turnstileToken: z.string().max(4096).optional(),
      assessment: assessmentSchema,
    })
    .safeParse(raw);
  if (!envelope.success)
    return json(
      {
        error: "Please correct the highlighted answers.",
        fields: Object.fromEntries(
          envelope.error.issues.map((i) => [
            i.path.filter((p) => p !== "assessment").join("."),
            i.message,
          ]),
        ),
      },
      400,
    );
  const { assessment: a, key, website, turnstileToken } = envelope.data;
  if (website) return json({ error: "Unable to verify this submission." }, 400);
  const hash = createHash("sha256").update(JSON.stringify(a)).digest("hex");
  try {
    const [existing] = await db
      .select()
      .from(leads)
      .where(eq(leads.submissionKey, key));
    if (existing && existing.submissionHash !== hash)
      return json(
        {
          error:
            "This submission key has already been used. Reload to start a new assessment.",
        },
        409,
      );
    if (!existing) {
      if (
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
        process.env.TURNSTILE_SECRET_KEY
      ) {
        const result = await verifyTurnstileToken(turnstileToken ?? "", ip);
        if (!result.ok)
          return json(
            { error: "Please complete the verification again." },
            400,
          );
      }
      const destination =
        (
          {
            China: "china",
            India: "india",
            Malaysia: "malaysia",
            "South Korea": "south_korea",
          } as Record<string, string>
        )[a.country] ?? "undecided";
      // Single SQL statement: assignment and lead insert share one snapshot. Trigger queues both jobs in the same transaction.
      await db.execute(sql`
        WITH assigned AS (
          SELECT p.* FROM counselor_profiles p JOIN users u ON u.id=p.id
          WHERE p.active AND p.auto_assign AND u.is_active AND u.role IN ('admin','counselor')
            AND p.full_name NOT LIKE '%TO BE CONFIGURED%'
            AND p.phone ~ '^[+][1-9][0-9]{6,14}$' AND p.whatsapp ~ '^[+][1-9][0-9]{6,14}$'
          LIMIT 1
        )
        INSERT INTO leads(name,phone,whatsapp,email,destination_interest,source,status,assessment,reference,submission_key,submission_hash,consent_at,consent_version,assigned_counselor_id)
        VALUES (${a.name},${a.phone},${a.whatsapp || null},${a.email || null},${destination},'consultation','new',
        ${JSON.stringify(a)}::jsonb || jsonb_build_object('assignedCounselor', COALESCE(
          (SELECT jsonb_build_object('fullName',full_name,'title',title,'phone',phone,'whatsapp',whatsapp) FROM assigned),
          ${JSON.stringify(defaultCounsellor)}::jsonb)),
        'SAC-' || to_char(now() AT TIME ZONE 'Asia/Dhaka','YYYY') || '-' || (SELECT lpad(n, greatest(length(n),6), '0') FROM (SELECT nextval('assessment_reference_seq')::text n) seq),
        ${key}::uuid,${hash},now(),${CONSENT_VERSION},
        (SELECT id FROM assigned)) ON CONFLICT (submission_key) DO NOTHING`);
    }
    const [lead] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.submissionKey, key), eq(leads.submissionHash, hash)));
    if (!lead)
      return json({ error: "Submission conflict. Please reload." }, 409);
    const [counselor] = lead.assignedCounselorId
      ? await db
          .select()
          .from(counselorProfiles)
          .where(eq(counselorProfiles.id, lead.assignedCounselorId))
      : [];
    // Start email delivery after the response. The durable outbox also supports scheduled retries.
    after(async () => {
      try {
        await processAssessmentOutbox({ leadId: lead.id, channel: "email" });
      } catch {
        console.error(
          "[consultation] Email processing failed; notification remains queued.",
        );
      }
    });
    return json({
      reference: lead.reference,
      firstName: a.name.split(" ")[0],
      counselor: counselor
        ? {
            fullName: counselor.fullName,
            title: counselor.title,
            phone: counselor.phone,
            whatsapp: counselor.whatsapp,
          }
        : (lead.assessment?.assignedCounselor ?? null),
    });
  } catch {
    return json(
      {
        error:
          "We could not save your assessment. Your answers are still here; please try again.",
      },
      503,
    );
  }
}
