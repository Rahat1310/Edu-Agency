import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import {
  loadApplicationCase,
  listApplicationSubmissions,
} from "@/lib/applications/load";
import {
  applicationReference,
  formStatusLabels,
  qualificationLabels,
} from "@/lib/applications/schema";
import { listDocumentsForApplication } from "@/lib/documents/list";
import { listLeadActivity } from "@/lib/leads/activity";
import {
  formatLeadDate,
  leadDestinationLabels,
  leadSourceLabels,
} from "@/lib/leads/labels";
import { ApplicationReview } from "@/components/desk/application-review";

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardAccess();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const application = await loadApplicationCase(id);
  if (!application) notFound();
  const [documents, activity, submissions] = await Promise.all([
    listDocumentsForApplication(id),
    listLeadActivity(application.leadId),
    listApplicationSubmissions(id),
  ]);
  const { data } = application;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap gap-5 text-sm">
        <Link href="/admin/applications" className="desk-focus underline">
          All applications
        </Link>
        <Link
          href={`/admin/leads?lead=${application.leadId}`}
          className="desk-focus underline"
        >
          Open linked lead
        </Link>
      </div>
      <header>
        <h1 className="text-3xl font-semibold">
          {data.fullName || application.name}
        </h1>
        <p className="mt-2 text-xs break-all text-[var(--desk-ink-muted)]">
          {applicationReference(id)} ·{" "}
          {formStatusLabels[application.formStatus]} · Original source:{" "}
          {leadSourceLabels[application.source] ?? application.source}
        </p>
      </header>
      <nav aria-label="Student file sections" className="flex flex-wrap gap-2">
        {[
          ["tracking", "Student tracker"],
          ["profile", "Application details"],
          ["review", "University & review"],
          ["documents", "Documents"],
          ["activity", "Activity"],
        ].map(([key, label]) => (
          <a
            href={`#${key}`}
            key={key}
            className="desk-focus rounded-full border border-[var(--desk-line)] px-4 py-3 text-sm font-semibold"
          >
            {label}
          </a>
        ))}
      </nav>
      <section
        id="profile"
        className="scroll-mt-20 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] p-5"
      >
        <h2 className="text-xl font-semibold">Application details</h2>
        {!application.hasSavedData && (
          <p className="mt-3 text-sm">
            The student has not saved the application form yet.
          </p>
        )}
        <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
          {[
            ["Full name", data.fullName],
            ["Account email", application.email],
            ["Contact number", data.phone || application.phone],
            ["Date of birth", data.dateOfBirth],
            ["Nationality", data.nationality],
            ["Passport number", data.passportNumber],
            ["Passport expiry", data.passportExpiry],
            ["Present address", data.address],
            ["Guardian", data.guardianName],
            ["Guardian contact", data.guardianPhone],
            ["Destination", leadDestinationLabels[data.country]],
            ["Preferred university", data.preferredUniversity],
            ["Preferred course", data.course],
            ["Intake", data.intake],
            ["English qualification", data.englishQualification],
            ["HSK qualification", data.hskQualification],
            ["Additional information", data.additionalInformation],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[var(--desk-ink-muted)]">{label}</dt>
              <dd className="mt-1 break-words whitespace-pre-wrap">
                {value || "Not provided"}
              </dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-7 font-semibold">Academic history</h3>
        <div className="mt-3 space-y-3">
          {data.education.map((entry, index) => (
            <div
              key={index}
              className="rounded-xl border border-[var(--desk-line)] p-4 text-sm"
            >
              <p className="font-semibold">
                {qualificationLabels[entry.qualification]} ·{" "}
                {entry.institution || "Institution pending"}
              </p>
              <p className="mt-2">
                {entry.board} · {entry.subject} · {entry.passingYear}
              </p>
              <p className="mt-2">
                Result: {entry.result || "Pending"} /{" "}
                {entry.gradingScale || "Scale pending"}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-[var(--desk-ink-muted)]">
          Student accuracy and review consent:{" "}
          {data.consent ? "Confirmed" : "Not yet confirmed"}
          {application.submittedAt
            ? ` · Submitted ${formatLeadDate(application.submittedAt)}`
            : ""}
        </p>
      </section>
      <section className="rounded-2xl border border-[var(--desk-line)] p-5">
        <h2 className="text-xl font-semibold">Submission history</h2>
        <p className="mt-2 text-sm text-[var(--desk-ink-muted)]">
          Each submission keeps a copy of the form and its uploaded document
          references.
        </p>
        {!submissions.length && (
          <p className="mt-3 text-sm">No submitted versions yet.</p>
        )}
        {submissions.map((submission) => (
          <details
            key={submission.id}
            className="mt-4 rounded-xl border border-[var(--desk-line)] p-4"
          >
            <summary className="desk-focus cursor-pointer text-sm font-semibold">
              Submitted {formatLeadDate(submission.submittedAt.toISOString())} ·
              revision {submission.revision}
            </summary>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Full name", submission.data.fullName],
                ["University preference", submission.data.preferredUniversity],
                ["Course", submission.data.course],
                ["Destination", leadDestinationLabels[submission.data.country]],
                ["Intake", submission.data.intake],
                ["Passport", submission.data.passportNumber],
                ["Address", submission.data.address],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[var(--desk-ink-muted)]">{label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-3 space-y-2 text-sm">
              {submission.data.education.map((entry, i) => (
                <li key={i}>
                  {qualificationLabels[entry.qualification]} ·{" "}
                  {entry.institution} · {entry.subject} · {entry.passingYear} ·{" "}
                  {entry.result} / {entry.gradingScale}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--desk-ink-muted)]">
              {submission.documentIds.length} uploaded document references
              retained.
            </p>
          </details>
        ))}
      </section>
      <ApplicationReview
        key={application.revision}
        application={application}
        documents={documents}
      />
      <section
        id="activity"
        className="scroll-mt-20 rounded-2xl border border-[var(--desk-line)] p-5"
      >
        <h2 className="text-xl font-semibold">Activity & contact history</h2>
        <ol className="mt-4 space-y-4">
          {[...activity].reverse().map((item) => (
            <li
              key={item.id}
              className="border-b border-[var(--desk-line)] pb-4 text-sm"
            >
              <p className="font-semibold">
                {item.actorLabel} · {formatLeadDate(item.createdAt)} ·{" "}
                {item.isVisibleToStudent ? "Visible to student" : "Staff only"}
              </p>
              <p className="mt-2 leading-7 whitespace-pre-wrap">
                {item.content || `${item.fromStatus} → ${item.toStatus}`}
              </p>
            </li>
          ))}
        </ol>
        {!activity.length && (
          <p className="mt-3 text-sm text-[var(--desk-ink-muted)]">
            No activity recorded yet.
          </p>
        )}
      </section>
    </div>
  );
}
