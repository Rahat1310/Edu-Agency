import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  leads,
  counselorProfiles,
  leadActivity,
  assessmentOutbox,
} from "@/db/schema";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import { statuses } from "@/lib/consultation/schema";
import { updateAssessment, retryAssessmentNotification } from "./actions";
export default async function LeadDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardAccess();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [lead] = await db.select().from(leads).where(eq(leads.id, id));
  if (!lead) notFound();
  const [counselors, notes, jobs] = await Promise.all([
    db.select().from(counselorProfiles),
    db
      .select()
      .from(leadActivity)
      .where(eq(leadActivity.leadId, id))
      .orderBy(desc(leadActivity.createdAt)),
    db.select().from(assessmentOutbox).where(eq(assessmentOutbox.leadId, id)),
  ]);
  const input =
    "mt-1 block w-full rounded border border-slate-300 bg-white p-3 text-slate-900";
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/admin/leads" className="underline">
        Back to leads
      </Link>
      <h1 className="text-2xl font-bold">{lead.reference ?? lead.name}</h1>
      <p>
        {lead.name} ·{" "}
        {lead.createdAt?.toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}{" "}
        (Asia/Dhaka)
      </p>
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
              <option key={s}>{s}</option>
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
      <section>
        <h2 className="text-lg font-semibold">Full assessment</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(lead.assessment ?? { message: lead.message }).map(
            ([k, v]) => (
              <div
                key={k}
                className="min-w-0 rounded-lg border border-slate-200 bg-white p-4"
              >
                <dt className="text-sm text-slate-500">
                  {k.replace(/([A-Z])/g, " $1")}
                </dt>
                <dd className="mt-1 break-words whitespace-pre-wrap">
                  {typeof v === "object"
                    ? JSON.stringify(v, null, 2)
                    : String(v ?? "—")}
                </dd>
              </div>
            ),
          )}
        </dl>
        <p className="mt-4">
          Source: {lead.source} · Consent: {lead.consentVersion} ·{" "}
          {lead.consentAt?.toISOString()}
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Notification delivery</h2>
        <p className="text-sm">
          Accepted means the provider accepted the request; it does not confirm
          delivery. Check the provider before retrying an uncertain request.
        </p>
        {jobs.map((j) => (
          <div key={j.id} className="rounded border bg-white p-4">
            <strong>
              {j.channel}: {j.status}
            </strong>
            <p>
              Attempts: {j.attempts} · Provider ID: {j.providerId ?? "—"}
            </p>
            <p>{j.error}</p>
            {["failed", "review_required", "configuration_required"].includes(
              j.status,
            ) && (
              <form action={retryAssessmentNotification}>
                <input type="hidden" name="id" value={j.id} />
                <label className="my-3 block">
                  <input type="checkbox" required /> I verified configuration
                  and confirmed this alert needs resending in the provider
                  dashboard.
                </label>
                <button className="underline">Retry notification</button>
              </form>
            )}
          </div>
        ))}
      </section>
      <section>
        <h2 className="text-lg font-semibold">Private notes & history</h2>
        {notes.map((n) => (
          <article
            key={n.id}
            className="mt-3 rounded border bg-white p-4 whitespace-pre-wrap"
          >
            <p>{n.content}</p>
            <small>
              {n.createdAt?.toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
            </small>
          </article>
        ))}
      </section>
    </div>
  );
}
