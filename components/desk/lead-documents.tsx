"use client";

import { useState } from "react";

import { reviewLeadDocument } from "@/app/admin/leads/actions";
import { useDeskToast } from "@/components/desk/toast";
import {
  DOCUMENT_REJECT_NOTE_MESSAGE,
  deskDocumentStatusLabels,
  documentTypeLabel,
} from "@/lib/documents/constants";
import type { StudentDocumentRow } from "@/lib/documents/types";
import type { LeadActivityItem } from "@/lib/leads/activity-types";
import { formatLeadDate } from "@/lib/leads/labels";

type LeadDocumentsProps = {
  leadId: string;
  documents: StudentDocumentRow[];
  onReviewed: (
    document: StudentDocumentRow,
    activity: LeadActivityItem | null,
  ) => void;
};

export function LeadDocuments({
  leadId,
  documents,
  onReviewed,
}: LeadDocumentsProps) {
  return (
    <section>
      <h3 className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
        Documents
      </h3>
      {documents.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--desk-ink-muted)]">
          No files on this lead yet. Students upload from the portal once their
          account is linked.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {documents.map((row) => (
            <li key={row.id}>
              <DocumentReviewRow
                leadId={leadId}
                row={row}
                onReviewed={onReviewed}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DocumentReviewRow({
  leadId,
  row,
  onReviewed,
}: {
  leadId: string;
  row: StudentDocumentRow;
  onReviewed: LeadDocumentsProps["onReviewed"];
}) {
  const { toast } = useDeskToast();
  const [opening, setOpening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState(row.reviewNote ?? "");
  const [noteError, setNoteError] = useState<string | null>(null);

  async function openPreview() {
    if (opening) {
      return;
    }

    setOpening(true);
    try {
      const response = await fetch(
        `/api/admin/documents/${row.id}/view?leadId=${encodeURIComponent(leadId)}`,
      );
      const payload = (await response.json()) as {
        ok: boolean;
        url?: string;
        message?: string;
        expiresInSeconds?: number;
      };

      if (!payload.ok || !payload.url) {
        toast({
          title: "Could not open file",
          description: payload.message,
          tone: "warn",
        });
        return;
      }

      window.open(payload.url, "_blank", "noopener,noreferrer");
      toast({
        title: "Preview opened",
        description: `The link stops working after ${payload.expiresInSeconds ?? 60} seconds.`,
        tone: "info",
      });
    } catch {
      toast({
        title: "Could not open file",
        tone: "warn",
      });
    } finally {
      setOpening(false);
    }
  }

  async function submit(decision: "approved" | "rejected") {
    if (busy) {
      return;
    }

    if (decision === "rejected") {
      const note = reviewNote.trim();
      if (!note) {
        setNoteError(DOCUMENT_REJECT_NOTE_MESSAGE);
        setRejectOpen(true);
        return;
      }
    }

    setBusy(true);
    setNoteError(null);

    const result = await reviewLeadDocument({
      documentId: row.id,
      leadId,
      decision,
      reviewNote: decision === "rejected" ? reviewNote.trim() : undefined,
    });

    if (!result.ok) {
      if (result.field === "reviewNote") {
        setNoteError(result.message);
        setRejectOpen(true);
      }
      toast({
        title: "Review not saved",
        description: result.message,
        tone: "warn",
      });
      setBusy(false);
      return;
    }

    onReviewed(result.document, result.activity);
    setRejectOpen(false);
    setReviewNote(result.document.reviewNote ?? "");
    toast({
      title:
        result.activity === null
          ? "Already recorded"
          : decision === "approved"
            ? "Approved"
            : "Sent back",
      description:
        result.activity === null
          ? "This file was already in that state."
          : decision === "approved"
            ? "The student will see this on their dashboard."
            : "The student will see the rejection and your reason.",
      tone: "ok",
    });
    setBusy(false);
  }

  return (
    <article
      className="rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2.5 py-2"
      data-status={row.status}
    >
      <p className="text-sm font-medium text-[var(--desk-ink)]">
        {documentTypeLabel(row.type)}
      </p>
      <p className="mt-0.5 truncate text-sm text-[var(--desk-ink-muted)]">
        {row.filename}
      </p>
      <p className="mt-1 text-[0.7rem] text-[var(--desk-ink-muted)]">
        {deskDocumentStatusLabels[row.status]}
        <span className="mx-1" aria-hidden="true">
          ·
        </span>
        {formatLeadDate(row.uploadedAt)}
      </p>
      {row.status === "rejected" && row.reviewNote && !rejectOpen ? (
        <p className="mt-2 text-sm whitespace-pre-wrap text-[var(--desk-ink)]">
          {row.reviewNote}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] px-2.5 text-xs font-semibold"
          onClick={() => void openPreview()}
          disabled={opening || busy}
        >
          {opening ? "Opening…" : "Preview"}
        </button>
        <button
          type="button"
          className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] px-2.5 text-xs font-semibold"
          onClick={() => void submit("approved")}
          disabled={busy}
        >
          Approve
        </button>
        <button
          type="button"
          className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] px-2.5 text-xs font-semibold"
          onClick={() => {
            setRejectOpen(true);
            setNoteError(null);
          }}
          disabled={busy}
        >
          Reject
        </button>
      </div>

      {rejectOpen ? (
        <form
          className="mt-2 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit("rejected");
          }}
        >
          <label className="block text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
            Why this file cannot be used
            <textarea
              value={reviewNote}
              onChange={(event) => {
                setReviewNote(event.target.value);
                if (noteError) {
                  setNoteError(null);
                }
              }}
              rows={3}
              maxLength={2000}
              disabled={busy}
              placeholder="e.g. The photo page is cut off — send a full-page colour scan."
              className="desk-focus mt-1 w-full resize-y rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-2 py-1.5 text-sm font-normal text-[var(--desk-ink)] normal-case"
            />
          </label>
          {noteError ? (
            <p role="alert" className="text-xs text-[var(--desk-ink)]">
              {noteError}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="submit"
              disabled={busy}
              className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-2.5 text-xs font-semibold disabled:opacity-50"
            >
              {busy ? "Saving…" : "Send back"}
            </button>
            <button
              type="button"
              className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] px-2.5 text-xs font-semibold text-[var(--desk-ink-muted)]"
              disabled={busy}
              onClick={() => {
                setRejectOpen(false);
                setNoteError(null);
                setReviewNote(row.reviewNote ?? "");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}
