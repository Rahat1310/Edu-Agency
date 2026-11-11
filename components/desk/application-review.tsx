"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewStudentApplication } from "@/app/admin/applications/actions";
import { moveLeadStage } from "@/app/admin/pipeline/actions";
import { LeadDocuments } from "@/components/desk/lead-documents";
import type { ApplicationCase } from "@/lib/applications/load";
import type { StudentDocumentRow } from "@/lib/documents/types";
import { applicationDocumentLabels } from "@/lib/applications/documents";
import {
  universityReviewStatuses,
  universityReviewLabels,
} from "@/lib/applications/schema";
import { leadStatusLabels } from "@/lib/leads/labels";
import { leadStatuses, type LeadStatus } from "@/db/schema";

const input =
  "desk-focus mt-1 block min-h-11 w-full rounded-xl border border-[var(--desk-line)] bg-[var(--desk-bg)] px-3 py-2 text-base";
const button =
  "desk-focus inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--desk-line)] px-5 py-2 text-sm font-semibold disabled:opacity-50";
export function ApplicationReview({
  application,
  documents,
}: {
  application: ApplicationCase;
  documents: StudentDocumentRow[];
}) {
  const router = useRouter();
  const [files, setFiles] = useState(documents);
  useEffect(() => setFiles(documents), [documents]);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState<LeadStatus>(application.stage);
  const [review, setReview] = useState({
    id: application.id,
    revision: application.revision,
    requestChanges: application.formStatus === "changes_requested",
    reviewMessage: application.reviewMessage ?? "",
    universityReview: application.universityReview,
    proposedUniversity: application.proposedUniversity ?? "",
    universityNote: application.universityNote ?? "",
    requestedDocuments: application.requestedDocuments,
    contactNote: "",
  });
  const submitted = Boolean(application.submittedAt);
  function save() {
    startTransition(async () => {
      try {
        const result = await reviewStudentApplication(review);
        setMessage(result.message);
        if (result.ok) router.refresh();
      } catch {
        setMessage(
          "The review could not be saved. Your entries remain here; please retry.",
        );
      }
    });
  }
  return (
    <div className="space-y-6">
      <section
        id="processing"
        className="scroll-mt-20 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] p-5"
      >
        <h2 className="text-xl font-semibold">Processing tracker</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--desk-ink-muted)]">
          This is the same stage used by the pipeline board and student tracker.
          Select Applied only after recording the university submission in the
          lead’s activity.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              try {
                const result = await moveLeadStage({
                  leadId: application.leadId,
                  fromStatus: application.stage,
                  toStatus: stage,
                });
                setMessage(
                  result.ok
                    ? "Processing stage updated in the pipeline and student tracker."
                    : result.message,
                );
                if (result.ok) router.refresh();
              } catch {
                setMessage(
                  "The processing stage could not be saved. Please refresh and try again.",
                );
              }
            });
          }}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <label className="min-w-48 flex-1 text-sm">
            Processing stage
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as LeadStatus)}
              className={input}
            >
              {leadStatuses.map((s) => (
                <option key={s} value={s}>
                  {leadStatusLabels[s]}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={pending || stage === application.stage}
            className={button}
          >
            Update tracker
          </button>
        </form>
      </section>
      <section
        id="review"
        className="scroll-mt-20 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] p-5"
      >
        <h2 className="text-xl font-semibold">Application review</h2>
        {!submitted && (
          <p className="mt-3 rounded-xl bg-orange-50 p-3 text-sm text-slate-800">
            The student is still preparing this draft. Review controls become
            available after submission.
          </p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="mt-5 space-y-5"
        >
          <fieldset disabled={!submitted || pending} className="space-y-5">
            <legend className="sr-only">
              University preference and student actions
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                University preference status
                <select
                  value={review.universityReview}
                  onChange={(e) =>
                    setReview({
                      ...review,
                      universityReview: e.target
                        .value as typeof review.universityReview,
                    })
                  }
                  className={input}
                >
                  {universityReviewStatuses.map((s) => (
                    <option key={s} value={s}>
                      {universityReviewLabels[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Suggested / agreed university
                <input
                  className={input}
                  value={review.proposedUniversity}
                  maxLength={160}
                  onChange={(e) =>
                    setReview({ ...review, proposedUniversity: e.target.value })
                  }
                />
              </label>
            </div>
            <label className="block text-sm">
              University update — visible to student
              <textarea
                rows={3}
                className={input}
                maxLength={2000}
                value={review.universityNote}
                onChange={(e) =>
                  setReview({ ...review, universityNote: e.target.value })
                }
              />
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={review.requestChanges}
                onChange={(e) =>
                  setReview({ ...review, requestChanges: e.target.checked })
                }
              />
              Reopen the form for corrections
            </label>
            <label className="block text-sm">
              Instructions / correction request — visible to student
              <textarea
                rows={3}
                className={input}
                maxLength={2000}
                value={review.reviewMessage}
                onChange={(e) =>
                  setReview({ ...review, reviewMessage: e.target.value })
                }
              />
            </label>
            <div>
              <h3 className="font-semibold">Additional required documents</h3>
              <p className="mt-1 text-xs leading-6 text-[var(--desk-ink-muted)]">
                Core academic documents already follow the student’s
                qualifications. Select additional documents only when needed for
                this file.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(applicationDocumentLabels)
                  .filter(([key]) =>
                    [
                      "english_proficiency",
                      "hsk",
                      "medical",
                      "non_criminal",
                      "bank_statement",
                      "recommendation_letter",
                      "study_plan",
                      "work_certificate",
                      "award_certificate",
                      "parent_id",
                      "salary_certificate",
                      "resume",
                    ].includes(key),
                  )
                  .map(([key, label]) => (
                    <label className="flex items-start gap-2 text-sm" key={key}>
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={review.requestedDocuments.includes(key)}
                        onChange={(e) =>
                          setReview({
                            ...review,
                            requestedDocuments: e.target.checked
                              ? [...review.requestedDocuments, key]
                              : review.requestedDocuments.filter(
                                  (k) => k !== key,
                                ),
                          })
                        }
                      />
                      {label}
                    </label>
                  ))}
              </div>
            </div>
            <label className="block text-sm">
              Contact / student agreement record — staff only
              <textarea
                rows={3}
                className={input}
                maxLength={1000}
                value={review.contactNote}
                onChange={(e) =>
                  setReview({ ...review, contactNote: e.target.value })
                }
              />
              <span className="mt-1 block text-xs text-[var(--desk-ink-muted)]">
                Record how and when you contacted the student. Required when
                marking a university choice agreed.
              </span>
            </label>
            <button
              type="submit"
              disabled={pending}
              className={`${button} bg-[var(--desk-accent)] text-white`}
            >
              {pending ? "Saving…" : "Publish application update"}
            </button>
          </fieldset>
        </form>
      </section>
      <p role="status" className="text-sm leading-7">
        {message}
      </p>
      <section
        id="documents"
        className="scroll-mt-20 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] p-5"
      >
        <LeadDocuments
          leadId={application.leadId}
          documents={files}
          onReviewed={(document) => {
            setFiles((current) =>
              current.map((file) =>
                file.id === document.id ? document : file,
              ),
            );
            router.refresh();
          }}
        />
      </section>
    </div>
  );
}
