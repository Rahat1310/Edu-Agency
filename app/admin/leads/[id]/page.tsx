import Link from "next/link";
import { LeadDeleteButton } from "@/components/admin/lead-delete-button";
import { AssessmentSections } from "@/components/consultation/assessment-sections";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { leads, counselorProfiles, leadActivity } from "@/db/schema";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import { statuses } from "@/lib/consultation/schema";
import {
  buildAssessmentSections,
  formatAssessmentDate,
  formatAssessmentStatus,
} from "@/lib/consultation/presentation";
import { updateAssessment } from "./actions";
export default async function LeadDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireDashboardAccess();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [lead] = await db.select().from(leads).where(eq(leads.id, id));
  if (!lead) notFound();
  const [counselors, notes] = await Promise.all([
    db.select().from(counselorProfiles),
    db
      .select()
      .from(leadActivity)
      .where(eq(leadActivity.leadId, id))
      .orderBy(desc(leadActivity.createdAt)),
  ]);
  const input =
    "mt-1 block w-full rounded border border-slate-300 bg-white p-3 text-slate-900";
  const sections = lead.assessment
    ? buildAssessmentSections({
        assessment: lead.assessment,
        counselor: counselors.find((c) => c.id === lead.assignedCounselorId),
        source: lead.source,
        consentAt: lead.consentAt,
        consentVersion: lead.consentVersion,
      })
    : [
        {
          title: "Enquiry",
          rows: [
            { label: "Message", value: lead.message || "No message provided" },
          ],
        },
      ];
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/admin/leads" className="underline">
        Back to leads
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{lead.reference ?? lead.name}</h1>
        {user.role === "admin" && (
          <LeadDeleteButton
            leadId={lead.id}
            name={lead.name}
            returnHref="/admin/leads"
          />
        )}
      </div>
      <p>
        {lead.name} · {formatAssessmentDate(lead.createdAt)}
      </p>
      {lead.assessment && (
        <p className="text-slate-600">
          {lead.assessment.degree} in {lead.assessment.subject} ·{" "}
          {lead.assessment.country}
        </p>
      )}
      <div className="flex flex-wrap gap-5">
        <a href={`tel:${lead.phone}`} className="underline">
          Call {lead.phone}
        </a>
        {lead.whatsapp && (
          <a
            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
            className="underline"
          >
            WhatsApp
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="underline">
            Email
          </a>
        )}
      </div>
      <form
        action={updateAssessment}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
      >
        <input type="hidden" name="id" value={id} />
        <label>
          Status
          <select
            name="status"
            defaultValue={lead.assessmentStatus}
            className={input}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {formatAssessmentStatus(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Assigned counsellor
          <select
            name="counselor"
            defaultValue={lead.assignedCounselorId ?? ""}
            className={input}
          >
            <option value="">Pending assignment</option>
            {counselors
              .filter((c) => c.active || c.id === lead.assignedCounselorId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                  {!c.active ? " (inactive)" : ""}
                </option>
              ))}
          </select>
        </label>
        <label>
          Follow-up date (Dhaka)
          <input
            name="followUp"
            type="date"
            defaultValue={
              lead.followUpAt?.toLocaleDateString("en-CA", {
                timeZone: "Asia/Dhaka",
              }) ?? ""
            }
            className={input}
          />
        </label>
        <label className="sm:col-span-2">
          Private counselling note
          <textarea name="note" maxLength={5000} className={input} />
        </label>
        <button className="rounded bg-slate-900 p-3 text-white">
          Save follow-up
        </button>
      </form>
      <section aria-labelledby="full-assessment-heading" className="space-y-5">
        <h2 id="full-assessment-heading" className="text-lg font-semibold">
          Full assessment
        </h2>
        <AssessmentSections sections={sections} />
      </section>
      <section>
        <h2 className="text-lg font-semibold">Private notes & history</h2>
        {notes.map((n) => (
          <article
            key={n.id}
            className="mt-3 rounded border bg-white p-4 whitespace-pre-wrap"
          >
            <p>{n.content}</p>
            <small>{formatAssessmentDate(n.createdAt)}</small>
          </article>
        ))}
      </section>
    </div>
  );
}
