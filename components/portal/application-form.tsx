"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { saveStudentApplication } from "@/app/portal/application/actions";
import { applicationDocumentChecklist } from "@/lib/applications/documents";
import {
  applicationReference,
  canEditApplication,
  emptyEducation,
  formStatusLabels,
  qualificationLabels,
  qualifications,
  universityReviewLabels,
  type ApplicationData,
} from "@/lib/applications/schema";
import type { ApplicationCase } from "@/lib/applications/load";
import type { StudentDocumentRow } from "@/lib/documents/types";
import {
  leadDestinationLabels,
  leadStatusLabels,
  formatLeadDate,
} from "@/lib/leads/labels";
import { leadDestinationInterests, programLevels } from "@/db/schema";
import { programLevelLabels } from "@/lib/programs-labels";

type TextKey = {
  [K in keyof ApplicationData]: ApplicationData[K] extends string ? K : never;
}[keyof ApplicationData];
const inputClass =
  "desk-focus mt-1 min-h-11 w-full rounded-xl border border-[var(--desk-line)] bg-[var(--desk-bg)] px-3 py-2 text-base text-[var(--desk-ink)] disabled:opacity-70";
const buttonClass =
  "desk-focus inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--desk-line)] px-5 py-2 text-sm font-semibold disabled:opacity-50";
const steps = [
  "Personal details",
  "Academic history",
  "Study preferences",
  "Documents & submit",
];
export function StudentApplicationForm({
  application,
  documents,
}: {
  application: ApplicationCase;
  documents: StudentDocumentRow[];
}) {
  const router = useRouter();
  const [data, setData] = useState(application.data);
  const [revision, setRevision] = useState(application.revision);
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const editable = canEditApplication(application.formStatus);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  function change(next: ApplicationData) {
    setData(next);
    setDirty(true);
    setMessage("");
  }
  function field(name: TextKey, label: string, type = "text", hint?: string) {
    return (
      <label className="block text-sm font-medium" key={name}>
        {label}
        <input
          name={name}
          type={type}
          value={data[name]}
          onChange={(e) => change({ ...data, [name]: e.target.value })}
          className={inputClass}
          maxLength={name === "phone" || name === "guardianPhone" ? 30 : 160}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
        />
        {hint && (
          <span className="mt-1 block text-xs text-[var(--desk-ink-muted)]">
            {hint}
          </span>
        )}
        {errors[name] && (
          <span
            id={`${name}-error`}
            className="mt-1 block text-sm text-red-700"
          >
            {errors[name]}
          </span>
        )}
      </label>
    );
  }
  function save(mode: "draft" | "submit", openDocuments = false) {
    setMessage("");
    setErrors({});
    startTransition(async () => {
      try {
        const result = await saveStudentApplication({ revision, mode, data });
        setMessage(result.message);
        if (result.ok) {
          setRevision(result.revision);
          setDirty(false);
          if (openDocuments) router.push("/portal/documents");
          else router.refresh();
        } else {
          setErrors(result.fields ?? {});
          const first = Object.keys(result.fields ?? {})[0];
          if (first?.startsWith("education")) setStep(1);
          else if (
            first &&
            [
              "country",
              "level",
              "preferredUniversity",
              "course",
              "intake",
            ].includes(first)
          )
            setStep(2);
          else if (first && first !== "consent") setStep(0);
        }
      } catch {
        setMessage(
          "We could not save your application. Please try again; your entries remain on this page.",
        );
      }
    });
  }
  const checklist = applicationDocumentChecklist(
    data,
    application.requestedDocuments,
  );
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-[var(--brand-green)] uppercase">
          Your application
        </p>
        <h1 className="font-heading mt-2 text-3xl font-semibold">
          Complete your application
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--desk-ink-muted)]">
          Complete your details, tell us your preferred university and upload
          your documents. Our admissions team will contact you and manage the
          university process.
        </p>
        <p className="mt-3 text-xs break-all text-[var(--desk-ink-muted)]">
          {applicationReference(application.id)} ·{" "}
          {formStatusLabels[application.formStatus]}
        </p>
      </div>
      <section className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <p className="font-semibold">
            Processing: {leadStatusLabels[application.stage]}
          </p>
          <Link href="/portal" className="desk-focus text-sm underline">
            Open progress tracker
          </Link>
        </div>
        <p className="mt-2 text-sm">
          {universityReviewLabels[application.universityReview]}
        </p>
        {application.proposedUniversity && (
          <p className="mt-2 text-sm">
            Suggested / agreed university:{" "}
            <strong>{application.proposedUniversity}</strong>
          </p>
        )}
        {application.universityNote && (
          <p className="mt-2 text-sm leading-7 whitespace-pre-wrap">
            {application.universityNote}
          </p>
        )}
        {application.reviewMessage && (
          <p className="mt-3 rounded-xl bg-orange-50 p-3 text-sm leading-7 whitespace-pre-wrap text-slate-800">
            {application.reviewMessage}
          </p>
        )}
        {application.submittedAt && (
          <p className="mt-3 text-xs text-[var(--desk-ink-muted)]">
            Submitted to our team: {formatLeadDate(application.submittedAt)}
          </p>
        )}
      </section>
      {!editable && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          Your form is with our team. You can upload further documents any time.
          Ask your counsellor to reopen the form if your information needs
          correcting.
        </p>
      )}
      <nav aria-label="Application sections" className="flex flex-wrap gap-2">
        {steps.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            aria-current={step === i ? "step" : undefined}
            className={`${buttonClass} ${step === i ? "bg-[var(--desk-accent)] text-white" : "bg-[var(--desk-surface)]"}`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </nav>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 3) save("submit");
          else setStep(step + 1);
        }}
        className="space-y-6"
      >
        <fieldset
          disabled={!editable || pending}
          className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] p-5 sm:p-7"
        >
          <legend className="sr-only">{steps[step]}</legend>
          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {field("fullName", "Full name as in passport")}
              {field("dateOfBirth", "Date of birth", "date")}
              {field("nationality", "Nationality")}
              {field("phone", "Contact number", "tel")}
              {field("passportNumber", "Passport number")}
              {field("passportExpiry", "Passport expiry", "date")}
              <label className="sm:col-span-2">
                Present address
                <textarea
                  value={data.address}
                  onChange={(e) => change({ ...data, address: e.target.value })}
                  maxLength={600}
                  className={inputClass}
                  rows={3}
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address && (
                  <span className="text-sm text-red-700">{errors.address}</span>
                )}
              </label>
              {field("guardianName", "Parent / guardian name (optional)")}
              {field(
                "guardianPhone",
                "Parent / guardian contact (optional)",
                "tel",
              )}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-sm leading-7 text-[var(--desk-ink-muted)]">
                Add each qualification you completed. Choose SSC or Dakhil, HSC,
                Diploma or Alim, and any university degrees. Use the result and
                scale shown on your transcript.
              </p>
              {data.education.map((entry, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[var(--desk-line)] p-4"
                >
                  <div className="flex items-end gap-3">
                    <label className="flex-1 text-sm">
                      Qualification
                      <select
                        value={entry.qualification}
                        className={inputClass}
                        onChange={(e) =>
                          change({
                            ...data,
                            education: data.education.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    qualification: e.target
                                      .value as typeof entry.qualification,
                                  }
                                : item,
                            ),
                          })
                        }
                      >
                        {qualifications.map((q) => (
                          <option key={q} value={q}>
                            {qualificationLabels[q]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={() =>
                        change({
                          ...data,
                          education: data.education.filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        ["institution", "Institution"],
                        ["board", "Board / awarding university"],
                        ["subject", "Group / subject"],
                        ["passingYear", "Passing year"],
                        ["result", "Result / GPA / CGPA"],
                        ["gradingScale", "Grading scale (e.g. 5.00 or 4.00)"],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="text-sm">
                        {label}
                        <input
                          value={entry[key]}
                          maxLength={
                            key === "passingYear"
                              ? 4
                              : key === "result" || key === "gradingScale"
                                ? 40
                                : 160
                          }
                          className={inputClass}
                          onChange={(e) =>
                            change({
                              ...data,
                              education: data.education.map((item, i) =>
                                i === index
                                  ? { ...item, [key]: e.target.value }
                                  : item,
                              ),
                            })
                          }
                          aria-invalid={Boolean(
                            errors[`education.${index}.${key}`],
                          )}
                        />
                        {errors[`education.${index}.${key}`] && (
                          <span className="text-sm text-red-700">
                            {errors[`education.${index}.${key}`]}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                  {errors[`education.${index}.qualification`] && (
                    <p className="mt-2 text-sm text-red-700">
                      {errors[`education.${index}.qualification`]}
                    </p>
                  )}
                </div>
              ))}
              {errors.education && (
                <p className="text-sm text-red-700">{errors.education}</p>
              )}
              <button
                type="button"
                disabled={data.education.length >= 7}
                className={buttonClass}
                onClick={() =>
                  change({
                    ...data,
                    education: [...data.education, emptyEducation("bachelor")],
                  })
                }
              >
                Add qualification
              </button>
              <div className="grid gap-4 sm:grid-cols-2">
                {field(
                  "englishQualification",
                  "English qualification / score (if available)",
                )}
                {field("hskQualification", "HSK level / score (if available)")}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm">
                Study destination
                <select
                  value={data.country}
                  onChange={(e) =>
                    change({
                      ...data,
                      country: e.target.value as ApplicationData["country"],
                    })
                  }
                  className={inputClass}
                >
                  {leadDestinationInterests.map((c) => (
                    <option key={c} value={c}>
                      {leadDestinationLabels[c]}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <span className="text-red-700">{errors.country}</span>
                )}
              </label>
              <label className="text-sm">
                Study level
                <select
                  value={data.level}
                  onChange={(e) =>
                    change({
                      ...data,
                      level: e.target.value as ApplicationData["level"],
                    })
                  }
                  className={inputClass}
                >
                  {programLevels.map((l) => (
                    <option key={l} value={l}>
                      {programLevelLabels[l]}
                    </option>
                  ))}
                </select>
              </label>
              {field(
                "preferredUniversity",
                "Preferred university",
                "text",
                "Type the university name. Enter “Undecided” if you need guidance.",
              )}
              {field("course", "Preferred course / subject")}
              {field(
                "intake",
                "Preferred intake",
                "text",
                "For example, September 2027.",
              )}
              <label className="text-sm sm:col-span-2">
                Additional information (optional)
                <textarea
                  value={data.additionalInformation}
                  onChange={(e) =>
                    change({ ...data, additionalInformation: e.target.value })
                  }
                  maxLength={2000}
                  className={inputClass}
                  rows={4}
                />
              </label>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold">Review your application</h2>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Student", data.fullName],
                  ["University preference", data.preferredUniversity],
                  ["Course", data.course],
                  ["Destination", leadDestinationLabels[data.country]],
                  ["Intake", data.intake],
                  [
                    "Qualifications",
                    data.education
                      .map((e) => qualificationLabels[e.qualification])
                      .join(", "),
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[var(--desk-ink-muted)]">{label}</dt>
                    <dd className="mt-1 font-semibold">
                      {value || "Not completed"}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm leading-7 text-[var(--desk-ink-muted)]">
                Upload the core documents below before submitting. Pending files
                can be reviewed after submission; rejected files need a
                replacement. Your team will request medical, financial or other
                supporting papers when needed.
              </p>
              <ul className="divide-y divide-[var(--desk-line)]">
                {checklist.map((slot) => {
                  const files = documents.filter(
                    (d) => d.type === slot.documentTypeKey,
                  );
                  const approved = files.some((d) => d.status === "approved");
                  const pendingFile = files.some((d) => d.status === "pending");
                  return (
                    <li
                      key={slot.documentTypeKey}
                      className="flex flex-wrap justify-between gap-2 py-3 text-sm"
                    >
                      <span>
                        {slot.documentName}
                        {slot.required ? " · Required" : " · If available"}
                      </span>
                      <span
                        className={
                          approved
                            ? "text-emerald-700"
                            : pendingFile
                              ? "text-[var(--desk-ink-muted)]"
                              : "text-orange-800"
                        }
                      >
                        {approved
                          ? "Approved"
                          : pendingFile
                            ? "Under review"
                            : files.length
                              ? "Correction needed"
                              : "Not uploaded"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className={buttonClass}
                onClick={() => save("draft", true)}
              >
                Save draft & upload documents
              </button>
              <label className="flex gap-3 text-sm leading-7">
                <input
                  type="checkbox"
                  className="mt-1.5 size-4 shrink-0"
                  checked={data.consent}
                  onChange={(e) =>
                    change({ ...data, consent: e.target.checked })
                  }
                />
                <span>
                  I confirm that my details and documents are accurate, and
                  consent to the admissions team reviewing my application and
                  contacting me about my preferred university and alternatives.
                </span>
              </label>
              {errors.consent && (
                <p className="text-sm text-red-700">{errors.consent}</p>
              )}
            </div>
          )}
        </fieldset>
        <p role="status" aria-live="polite" className="text-sm leading-7">
          {message ||
            (dirty
              ? "You have unsaved changes."
              : `Last saved: ${formatLeadDate(application.updatedAt)}`)}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              className={buttonClass}
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}
          {editable && (
            <button
              type="button"
              disabled={pending}
              className={buttonClass}
              onClick={() => save("draft")}
            >
              {pending ? "Saving…" : "Save draft"}
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              className={`${buttonClass} bg-[var(--desk-accent)] text-white`}
              onClick={() => setStep(step + 1)}
            >
              Continue
            </button>
          ) : editable ? (
            <button
              type="submit"
              disabled={pending}
              className={`${buttonClass} bg-[var(--desk-accent)] text-white`}
            >
              Submit to admissions team
            </button>
          ) : (
            <Link className={buttonClass} href="/portal/documents">
              Open documents
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
