"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, ChevronRight } from "lucide-react";
import { updateApplicationTracking } from "@/app/admin/applications/actions";
import { ApplicationTracker } from "@/components/portal/application-tracker";
import type { ApplicationCase } from "@/lib/applications/load";
import {
  applicationTrackingSteps,
  trackingStatuses,
  trackingStatusLabels,
  type TrackingStepId,
  type TrackingStep,
} from "@/lib/applications/tracking";
import { applicationReference } from "@/lib/applications/schema";
import { cn } from "@/lib/utils";

const inputClass =
  "desk-focus mt-2 min-h-11 w-full rounded-xl border border-[var(--desk-line)] bg-[var(--desk-bg)] px-3 py-2 text-sm";
export function ApplicationTrackingEditor({
  application,
}: {
  application: ApplicationCase;
}) {
  const router = useRouter();
  const [step, setStep] = useState<TrackingStepId>(
    () =>
      applicationTrackingSteps.find(
        (item) =>
          item.id !== "submitted" &&
          application.tracking[item.id]?.status !== "completed",
      )?.id ?? "ready",
  );
  const [status, setStatus] = useState<TrackingStep["status"]>("in_progress");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const saved = application.tracking[step];
    setStatus(saved?.status ?? "in_progress");
    setNote(saved?.note ?? "");
  }, [step, application.tracking]);
  const submitted = Boolean(application.submittedAt);
  return (
    <section
      id="tracking"
      className="scroll-mt-20 space-y-5 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] p-5 sm:p-6"
    >
      <div>
        <h2 className="text-xl font-semibold">Student application tracker</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--desk-ink-muted)]">
          Publish milestones and notes to the student’s dashboard. Complete
          steps in order. Mark a problem as “Needs attention” and explain what
          happens next.
        </p>
      </div>
      {!submitted && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Tracking starts when the student submits their application.
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <ol className="space-y-1" aria-label="Application milestones">
          {applicationTrackingSteps.map((item, index) => {
            const state = application.tracking[item.id]?.status ?? "pending";
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!submitted || pending || item.id === "submitted"}
                  onClick={() => {
                    setStep(item.id);
                    setMessage("");
                  }}
                  aria-pressed={step === item.id}
                  className={cn(
                    "desk-focus flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm disabled:cursor-default",
                    step === item.id && "bg-[var(--desk-surface-muted)]",
                    state === "blocked" && "text-rose-700",
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-current/20 text-xs">
                    {state === "completed" ? (
                      <Check size={14} aria-hidden="true" />
                    ) : state === "blocked" ? (
                      <AlertCircle size={14} aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-xs opacity-70">
                      {trackingStatusLabels[state]}
                      {item.id === "submitted" ? " · Automatic" : ""}
                    </span>
                  </span>
                  {step === item.id && (
                    <ChevronRight size={15} aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");
            startTransition(async () => {
              try {
                const result = await updateApplicationTracking({
                  id: application.id,
                  version: application.trackingVersion,
                  step,
                  status,
                  note,
                });
                setFailed(!result.ok);
                setMessage(result.message);
                if (result.ok) router.refresh();
              } catch {
                setFailed(true);
                setMessage(
                  "The update could not be saved. Your note is still here; please retry.",
                );
              }
            });
          }}
          className="rounded-xl border border-[var(--desk-line)] p-4 sm:p-5"
        >
          <fieldset disabled={!submitted || pending} className="space-y-4">
            <legend className="mb-4 text-base font-semibold">
              {applicationTrackingSteps.find((item) => item.id === step)?.label}
            </legend>
            <label className="block text-sm font-medium">
              Status
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TrackingStep["status"])
                }
                className={inputClass}
              >
                {trackingStatuses.map((value) => (
                  <option key={value} value={value}>
                    {trackingStatusLabels[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              {status === "blocked"
                ? "Problem and next action (required)"
                : "Note for the student (optional)"}
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                required={status === "blocked"}
                maxLength={2000}
                rows={5}
                className={cn(
                  inputClass,
                  status === "blocked" && "border-rose-300",
                )}
                placeholder={
                  status === "blocked"
                    ? "Example: Your passport scan is blurry. Please upload a clear colour copy of the photo page."
                    : "Share a short update about this step."
                }
              />
            </label>
            <p className="text-xs leading-5 text-[var(--desk-ink-muted)]">
              This note is visible to the student. Resolving a problem replaces
              its red warning; previous updates remain in the activity history.
            </p>
            <button
              type="submit"
              className="desk-focus min-h-11 rounded-full bg-[var(--desk-accent)] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Publishing…" : "Publish tracker update"}
            </button>
          </fieldset>
          {message && (
            <p
              role={failed ? "alert" : "status"}
              className={cn(
                "mt-4 text-sm leading-6",
                failed ? "text-rose-700" : "text-emerald-700",
              )}
            >
              {message}
            </p>
          )}
        </form>
      </div>
      <details className="border-t border-[var(--desk-line)] pt-4">
        <summary className="desk-focus cursor-pointer text-sm font-semibold">
          Preview the student tracker
        </summary>
        <div className="mt-5">
          <ApplicationTracker
            tracking={application.tracking}
            submittedAt={application.submittedAt}
            reference={applicationReference(application.id)}
          />
        </div>
      </details>
    </section>
  );
}
