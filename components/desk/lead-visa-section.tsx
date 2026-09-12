"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  createLeadVisaApplication,
  updateLeadVisaApplication,
} from "@/app/admin/leads/actions";
import { DeskEmptyState } from "@/components/desk/empty-state";
import { DeskErrorState } from "@/components/desk/error-state";
import { DeskPreviewBar, useDeskPreview } from "@/components/desk/preview";
import { DeskVisaSkeleton } from "@/components/desk/skeleton";
import { useDeskToast } from "@/components/desk/toast";
import { visaApplicationSubStatuses } from "@/db/schema";
import type { LeadActivityItem } from "@/lib/leads/activity-types";
import { leadDestinationLabels } from "@/lib/leads/labels";
import {
  visaApplicationStudentLine,
  visaApplicationSubStatusLabels,
} from "@/lib/visa-applications/copy";
import { toDatetimeLocalValue } from "@/lib/visa-applications/dates";
import type { DeskVisaApplication } from "@/lib/visa-applications/types";

type LeadVisaSectionProps = {
  leadId: string;
  visa: DeskVisaApplication | null;
  hasLinkedApplication: boolean;
  loadError?: boolean;
  inVisaStage?: boolean;
  onUpdated: (
    visa: DeskVisaApplication,
    activity: LeadActivityItem | null,
  ) => void;
};

const fieldClass =
  "desk-focus mt-1 w-full rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2 py-1.5 text-sm font-normal text-[var(--desk-ink)] normal-case";

export function LeadVisaSection({
  leadId,
  visa,
  hasLinkedApplication,
  loadError = false,
  inVisaStage = true,
  onUpdated,
}: LeadVisaSectionProps) {
  const router = useRouter();
  const { preview, setPreview } = useDeskPreview();
  const [liveMessage, setLiveMessage] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (announceTimer.current) {
        clearTimeout(announceTimer.current);
      }
    };
  }, []);

  const showLoading = preview === "loading";
  const showError = preview === "error" || (preview === "off" && loadError);
  const showEmpty =
    preview === "empty" || (preview === "off" && !loadError && !visa);
  const isDev = process.env.NODE_ENV !== "production";

  function announceStatus(message: string) {
    setSaveError(null);
    setLiveMessage("");
    if (announceTimer.current) {
      clearTimeout(announceTimer.current);
    }
    announceTimer.current = setTimeout(() => {
      setLiveMessage(message);
    }, 0);
  }

  function announceError(message: string) {
    setLiveMessage("");
    setSaveError(message);
  }

  function onRetry() {
    if (preview === "error") {
      setPreview("off");
      return;
    }

    router.refresh();
  }

  if (!inVisaStage && !loadError && preview === "off" && !isDev) {
    return null;
  }

  if (!inVisaStage && !loadError && preview === "off") {
    return (
      <div>
        <DeskPreviewBar preview={preview} onChange={setPreview} />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="lead-visa-heading"
      aria-busy={showLoading || undefined}
    >
      <h3
        id="lead-visa-heading"
        className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase"
      >
        Visa
      </h3>
      <div className="mt-2">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>
      {saveError ? (
        <p
          role="alert"
          className="mt-2 rounded-[var(--desk-radius)] border border-[var(--desk-warn)]/40 bg-[var(--desk-bg)] px-2.5 py-2 text-sm text-[var(--desk-ink)]"
        >
          {saveError}
        </p>
      ) : null}
      <div className="mt-2">
        {showLoading ? (
          <DeskVisaSkeleton />
        ) : showError ? (
          <DeskErrorState
            title="Visa tracking could not load"
            body="The rest of this file is still here. Try again."
            onRetry={onRetry}
          />
        ) : showEmpty ? (
          <MissingVisaFile
            leadId={leadId}
            hasLinkedApplication={hasLinkedApplication}
            onUpdated={onUpdated}
            onAnnounce={announceStatus}
            onError={announceError}
          />
        ) : visa ? (
          <VisaForm
            leadId={leadId}
            visa={visa}
            onUpdated={onUpdated}
            onAnnounce={announceStatus}
            onError={announceError}
          />
        ) : null}
      </div>
    </section>
  );
}

function MissingVisaFile({
  leadId,
  hasLinkedApplication,
  onUpdated,
  onAnnounce,
  onError,
}: {
  leadId: string;
  hasLinkedApplication: boolean;
  onUpdated: LeadVisaSectionProps["onUpdated"];
  onAnnounce: (message: string) => void;
  onError: (message: string) => void;
}) {
  const { toast } = useDeskToast();
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    if (busy) {
      return;
    }

    setBusy(true);
    const result = await createLeadVisaApplication({ leadId });
    if (!result.ok) {
      toast({
        title: "Visa file not created",
        description: result.message,
        tone: "warn",
      });
      onError(result.message);
      setBusy(false);
      return;
    }

    onUpdated(result.visa, result.activity);
    onAnnounce(visaApplicationStudentLine(result.visa));
    toast({
      title: "Visa file created",
      description: "Tracking starts at preparing documents.",
      tone: "ok",
    });
    setBusy(false);
  }

  return (
    <div aria-busy={busy || undefined}>
      <DeskEmptyState
        title="No visa file yet"
        body={
          hasLinkedApplication
            ? "This is usually created when the card moves to Visa. Create one if this file skipped that step."
            : "Link a student account first. The visa file is created when this card moves to Visa."
        }
        action={
          hasLinkedApplication ? (
            <button
              type="button"
              className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] px-2.5 text-xs font-semibold"
              onClick={() => void onCreate()}
              disabled={busy}
            >
              {busy ? "Creating…" : "Create visa file"}
            </button>
          ) : null
        }
      />
    </div>
  );
}

function VisaForm({
  leadId,
  visa,
  onUpdated,
  onAnnounce,
  onError,
}: {
  leadId: string;
  visa: DeskVisaApplication;
  onUpdated: LeadVisaSectionProps["onUpdated"];
  onAnnounce: (message: string) => void;
  onError: (message: string) => void;
}) {
  const { toast } = useDeskToast();
  const [subStatus, setSubStatus] = useState(visa.subStatus);
  const [referenceNumber, setReferenceNumber] = useState(
    visa.referenceNumber ?? "",
  );
  const [submittedAt, setSubmittedAt] = useState(
    toDatetimeLocalValue(visa.submittedAt),
  );
  const [decidedAt, setDecidedAt] = useState(
    toDatetimeLocalValue(visa.decidedAt),
  );
  const [notes, setNotes] = useState(visa.notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSubStatus(visa.subStatus);
    setReferenceNumber(visa.referenceNumber ?? "");
    setSubmittedAt(toDatetimeLocalValue(visa.submittedAt));
    setDecidedAt(toDatetimeLocalValue(visa.decidedAt));
    setNotes(visa.notes ?? "");
  }, [visa]);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) {
      return;
    }

    setSaving(true);
    const result = await updateLeadVisaApplication({
      leadId,
      subStatus,
      referenceNumber,
      submittedAt,
      decidedAt,
      notes,
    });

    if (!result.ok) {
      toast({
        title: "Visa file not saved",
        description: result.message,
        tone: "warn",
      });
      onError(result.message);
      setSaving(false);
      return;
    }

    onUpdated(result.visa, result.activity);
    const studentLine = visaApplicationStudentLine(result.visa);
    if (result.activity === null) {
      onAnnounce("Nothing had changed.");
    } else if (result.activity.isVisibleToStudent) {
      onAnnounce(studentLine);
    } else {
      onAnnounce(
        `Saved on the file. ${studentLine} Internal dates and notes stay off the student dashboard.`,
      );
    }
    toast({
      title:
        result.activity === null ? "Already saved" : "Visa tracking updated",
      description:
        result.activity === null
          ? "Nothing had changed."
          : result.activity.isVisibleToStudent
            ? "The student will see this on their dashboard."
            : "Saved on the file. Internal dates and notes stay off the student dashboard.",
      tone: "ok",
    });
    setSaving(false);
  }

  return (
    <div>
      <p className="text-xs text-[var(--desk-ink-muted)]">
        Inside the Visa pipeline stage
        <span className="mx-1" aria-hidden="true">
          ·
        </span>
        {leadDestinationLabels[visa.destination]}
      </p>
      <form
        className="mt-2 space-y-2"
        onSubmit={onSave}
        aria-busy={saving || undefined}
      >
        <label className="block text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          Sub-status
          <select
            className={fieldClass}
            value={subStatus}
            disabled={saving}
            onChange={(event) =>
              setSubStatus(
                event.target
                  .value as (typeof visaApplicationSubStatuses)[number],
              )
            }
          >
            {visaApplicationSubStatuses.map((value) => (
              <option key={value} value={value}>
                {visaApplicationSubStatusLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          Reference number
          <input
            className={fieldClass}
            value={referenceNumber}
            disabled={saving}
            maxLength={80}
            placeholder="EMGS / SII tracking number"
            onChange={(event) => setReferenceNumber(event.target.value)}
          />
        </label>
        <label className="block text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          Submitted
          <input
            type="datetime-local"
            className={fieldClass}
            value={submittedAt}
            disabled={saving}
            onChange={(event) => setSubmittedAt(event.target.value)}
          />
        </label>
        <label className="block text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          Decided
          <input
            type="datetime-local"
            className={fieldClass}
            value={decidedAt}
            disabled={saving}
            onChange={(event) => setDecidedAt(event.target.value)}
          />
        </label>
        <label className="block text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          Internal notes
          <textarea
            className={`${fieldClass} resize-y`}
            rows={3}
            maxLength={4000}
            value={notes}
            disabled={saving}
            placeholder="Stays on the desk. Students do not see this."
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-2.5 text-xs font-semibold disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save visa tracking"}
        </button>
      </form>
    </div>
  );
}
