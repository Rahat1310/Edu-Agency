"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { DeskPreviewBar, useDeskPreview } from "@/components/desk/preview";
import { useDeskToast } from "@/components/desk/toast";
import { PortalInfoDrawer } from "@/components/portal/info-drawer";
import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { PortalErrorState } from "@/components/portal/portal-error-state";
import { PortalDocumentsSkeleton } from "@/components/portal/portal-skeletons";
import type { LeadDestinationInterest } from "@/db/schema";
import type { StudentDocumentRow } from "@/lib/documents/types";
import {
  DOCUMENT_MAX_BYTES,
  documentStatusLabels,
  documentTypeLabels,
  documentTypeValues,
  isAllowedDocumentMime,
  isGeneralDocumentType,
  mimeMatchesFilename,
  type DocumentMimeType,
} from "@/lib/documents/constants";
import { putFileWithProgress } from "@/lib/documents/put-with-progress";
import {
  explainChooseFileProblem,
  explainUploadProblem,
  explainWrongTypeFile,
  type UploadProblem,
} from "@/lib/documents/upload-errors";
import { formatLeadDate } from "@/lib/leads/labels";
import { documentHints } from "@/lib/portal/copy";
import { cn } from "@/lib/utils";
import { documentTypeAnchorId } from "@/lib/visa-requirements/checklist";
import { getWhatsAppHref } from "@/lib/whatsapp";

export type VisaUploadSlot = {
  documentTypeKey: string;
  documentName: string;
  description: string | null;
};

type PortalDocumentsProps = {
  applicationId: string;
  documents: StudentDocumentRow[];
  destination: LeadDestinationInterest;
  studentName: string;
  visaSlots?: VisaUploadSlot[];
  focusType?: string | null;
};

type UploadPhase = "idle" | "start" | "put" | "save";

export function PortalDocuments({
  applicationId,
  documents,
  destination,
  studentName,
  visaSlots = [],
  focusType = null,
}: PortalDocumentsProps) {
  const { preview, setPreview } = useDeskPreview();
  const hints = documentHints(destination);
  const whatsappHref = getWhatsAppHref(
    `Hi, I'm ${studentName}. I want to check which documents you need from me.`,
  );
  const rows = preview === "empty" ? [] : documents;
  const extraSlots = visaSlots.filter(
    (slot) => !isGeneralDocumentType(slot.documentTypeKey),
  );

  useEffect(() => {
    if (!focusType) {
      return;
    }

    document
      .getElementById(documentTypeAnchorId(focusType))
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [focusType]);

  if (preview === "loading") {
    return (
      <div className="space-y-3">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <PortalDocumentsSkeleton />
      </div>
    );
  }

  if (preview === "error") {
    return (
      <div className="space-y-3">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <div className="mx-auto max-w-2xl">
          <PortalErrorState
            title="We couldn't load your papers"
            body="Nothing you already sent is lost. Try again, or WhatsApp us if this keeps happening."
            onRetry={() => setPreview("off")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DeskPreviewBar preview={preview} onChange={setPreview} />
      <div className="mx-auto max-w-2xl">
        <p className="font-utility text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--brand-green)] uppercase">
          Documents
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--desk-accent)]">
          Your papers, one file at a time
        </h1>
        <p className="mt-2 text-base leading-7 text-[var(--desk-ink-muted)]">
          PDF, JPG, or PNG, under 10 MB. A counselor sees it after it lands here
          — don&apos;t send the same file on WhatsApp unless we ask.
        </p>

        <div className="mt-4">
          <PortalInfoDrawer
            triggerLabel="What families usually get ready"
            title="Start gathering these"
          >
            <p>
              These are the papers almost every file needs. Country-specific
              visa forms come later — after an offer, not before.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              {hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </PortalInfoDrawer>
        </div>

        {rows.length === 0 ? (
          <div className="mt-8">
            <PortalEmptyState
              title="Your file is empty — start with one scan"
              body="A passport photo page or your latest marksheet is enough for a first look. Pick a type below and upload. We'll tell you if we need a different page."
              action={
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#document-types"
                    className="desk-focus desk-press inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] bg-[var(--desk-bg)] px-4 text-sm font-semibold text-[var(--desk-ink)]"
                  >
                    Choose a type to upload
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="desk-focus desk-press inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] px-4 text-sm font-semibold text-[var(--desk-ink)]"
                  >
                    Ask on WhatsApp
                  </a>
                </div>
              }
            />
          </div>
        ) : null}

        <div id="document-types" className="mt-8 scroll-mt-20 space-y-4">
          {documentTypeValues.map((type) => (
            <TypeCard
              key={type}
              applicationId={applicationId}
              type={type}
              label={documentTypeLabels[type]}
              rows={rows.filter((row) => row.type === type)}
              highlighted={focusType === type}
            />
          ))}
          {extraSlots.length > 0 ? (
            <div className="pt-2">
              <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
                Visa papers for this route
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--desk-ink-muted)]">
                These are the country-specific files from your visa checklist.
                Upload the one you opened this page for, or any other you
                already have.
              </p>
            </div>
          ) : null}
          {extraSlots.map((slot) => (
            <TypeCard
              key={slot.documentTypeKey}
              applicationId={applicationId}
              type={slot.documentTypeKey}
              label={slot.documentName}
              description={slot.description}
              rows={rows.filter((row) => row.type === slot.documentTypeKey)}
              highlighted={focusType === slot.documentTypeKey}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TypeCard({
  applicationId,
  type,
  label,
  description,
  rows,
  highlighted = false,
}: {
  applicationId: string;
  type: string;
  label: string;
  description?: string | null;
  rows: StudentDocumentRow[];
  highlighted?: boolean;
}) {
  const router = useRouter();
  const { toast } = useDeskToast();
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [percent, setPercent] = useState(0);
  const [problem, setProblem] = useState<UploadProblem | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const busy = phase !== "idle";

  function announce(message: string, nextProblem?: UploadProblem | null) {
    if (nextProblem) {
      setProblem(nextProblem);
      setLiveMessage("");
      return;
    }

    setProblem(null);
    setLiveMessage(message);
  }

  async function onFile(file: File | undefined) {
    if (!file || busy) {
      return;
    }

    const chosen = explainChooseFileProblem(file, DOCUMENT_MAX_BYTES);
    if (chosen) {
      announce(`${chosen.title}. ${chosen.description}`, chosen);
      return;
    }

    const contentType = mimeForFile(file);
    if (!contentType) {
      const wrongType = explainWrongTypeFile();
      announce(`${wrongType.title}. ${wrongType.description}`, wrongType);
      return;
    }

    setPhase("start");
    setPercent(8);
    let stage: UploadPhase = "start";
    announce(`Sending ${label}.`);

    try {
      const intentResponse = await fetch("/api/portal/documents/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          type,
          filename: file.name,
          contentType,
          size: file.size,
        }),
      });
      const intent = (await readJson(intentResponse)) as {
        ok?: boolean;
        message?: string;
        key?: string;
        uploadUrl?: string;
        headers?: Record<string, string>;
      };

      if (
        !intentResponse.ok ||
        !intent.ok ||
        !intent.uploadUrl ||
        !intent.key ||
        !intent.headers
      ) {
        const mapped = explainUploadProblem({
          stage: "start",
          status: intentResponse.status,
          serverMessage: intent.message,
        });
        announce(`${mapped.title}. ${mapped.description}`, mapped);
        return;
      }

      stage = "put";
      setPhase("put");
      setPercent(10);
      announce(`Sending ${label}.`);

      const put = await putFileWithProgress(
        intent.uploadUrl,
        file,
        intent.headers,
        (progress) => {
          setPercent(10 + Math.round(progress.percent * 0.8));
        },
      );

      if (!put.ok) {
        const mapped = explainUploadProblem({
          stage: "put",
          status: put.status,
        });
        announce(`${mapped.title}. ${mapped.description}`, mapped);
        return;
      }

      stage = "save";
      setPhase("save");
      setPercent(92);
      announce(`Saving ${label} to your file.`);

      const completeResponse = await fetch("/api/portal/documents/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          type,
          filename: file.name,
          contentType,
          size: file.size,
          key: intent.key,
        }),
      });
      const complete = (await readJson(completeResponse)) as {
        ok?: boolean;
        message?: string;
      };

      if (!completeResponse.ok || !complete.ok) {
        const mapped = explainUploadProblem({
          stage: "save",
          status: completeResponse.status,
          serverMessage: complete.message,
        });
        announce(`${mapped.title}. ${mapped.description}`, mapped);
        return;
      }

      setPercent(100);
      const success =
        "It's in your file. A counselor will look at it. Status starts as waiting.";
      announce(success);
      toast({
        title: "It's in your file",
        description: "A counselor will look at it. Status starts as waiting.",
        tone: "ok",
      });
      router.refresh();
    } catch (error) {
      const mapped = explainUploadProblem({
        stage,
        error,
      });
      announce(`${mapped.title}. ${mapped.description}`, mapped);
    } finally {
      setPhase("idle");
      setPercent(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  const progressLabel =
    phase === "start"
      ? "Getting a place to send it…"
      : phase === "put"
        ? `Sending… ${percent}%`
        : phase === "save"
          ? "Saving to your file…"
          : "";

  return (
    <section
      id={documentTypeAnchorId(type)}
      className={cn(
        "scroll-mt-24 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5",
        highlighted &&
          "ring-2 ring-[var(--desk-accent)] ring-offset-2 ring-offset-[var(--desk-bg)]",
      )}
      aria-busy={busy}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {highlighted ? (
            <p className="mb-1 text-xs font-semibold tracking-[0.08em] text-[var(--desk-accent)] uppercase">
              From your visa checklist
            </p>
          ) : null}
          <h2 className="text-base font-semibold text-[var(--desk-accent)]">
            {label}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-[var(--desk-ink-muted)]">
              {description}
            </p>
          ) : null}
          <p id={hintId} className="mt-1 text-sm text-[var(--desk-ink-muted)]">
            PDF, JPG, or PNG · 10 MB max
          </p>
        </div>
        <label className="desk-focus-within desk-press relative inline-flex min-h-11 cursor-pointer items-center overflow-hidden rounded-full border border-[var(--desk-line)] px-4 text-sm font-semibold text-[var(--desk-ink)]">
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            className="absolute inset-0 cursor-pointer opacity-0"
            accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
            disabled={busy}
            aria-describedby={hintId}
            aria-label={`Upload ${label}, PDF, JPG, or PNG, 10 MB maximum`}
            onChange={(event) => onFile(event.target.files?.[0])}
          />
          <span aria-hidden="true">{busy ? "Sending…" : "Upload"}</span>
        </label>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>

      {busy ? (
        <div className="mt-4">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={progressLabel}
            aria-label={`Upload progress for ${label}`}
            className="h-2 overflow-hidden rounded-full bg-[var(--desk-surface-muted)]"
          >
            <div
              className="h-full rounded-full bg-[var(--desk-accent-2)] transition-[width] duration-200 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[var(--desk-ink-muted)]">
            {progressLabel}
          </p>
        </div>
      ) : null}

      {problem ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-[var(--desk-warn)]/40 bg-[var(--desk-bg)] px-3 py-3 text-sm leading-6 text-[var(--desk-ink)]"
        >
          <span className="block font-semibold">{problem.title}</span>
          <span className="mt-1 block text-[var(--desk-ink-muted)]">
            {problem.description}
          </span>
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--desk-ink-muted)]">
          No {label.toLowerCase()} here yet. Upload a PDF, JPG, or PNG when you
          have it.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((row) => (
            <DocumentRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </section>
  );
}

function DocumentRow({ row }: { row: StudentDocumentRow }) {
  const { toast } = useDeskToast();
  const [opening, setOpening] = useState(false);

  async function openView() {
    if (opening) {
      return;
    }

    setOpening(true);
    try {
      const response = await fetch(`/api/portal/documents/${row.id}/view`);
      const payload = (await readJson(response)) as {
        ok?: boolean;
        url?: string;
        message?: string;
        expiresInSeconds?: number;
      };

      if (!response.ok || !payload.ok || !payload.url) {
        toast({
          title: "We couldn't open that file",
          description:
            payload.message ??
            "Try again in a moment. If it keeps failing, WhatsApp us.",
          tone: "warn",
        });
        return;
      }

      window.open(payload.url, "_blank", "noopener,noreferrer");
      toast({
        title: "Link opened",
        description: `It stops working after ${payload.expiresInSeconds ?? 60} seconds. Ask for a new one if you need it again.`,
        tone: "info",
      });
    } catch {
      toast({
        title: "We couldn't open that file",
        description: "Check your connection and try once more.",
        tone: "warn",
      });
    } finally {
      setOpening(false);
    }
  }

  return (
    <li
      className="rounded-xl border border-[var(--desk-line)] bg-[var(--desk-bg)] px-3 py-3"
      data-status={row.status}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--desk-ink)]">
            {row.filename}
          </p>
          <p className="mt-1 text-sm text-[var(--desk-ink-muted)]">
            {documentStatusLabels[row.status]}
            <span className="mx-1" aria-hidden="true">
              ·
            </span>
            {formatLeadDate(row.uploadedAt)}
          </p>
          {row.status === "rejected" && row.reviewNote ? (
            <p className="mt-2 text-sm text-[var(--desk-ink)]">
              {row.reviewNote}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="desk-focus desk-press inline-flex h-9 items-center rounded-full border border-[var(--desk-line)] px-3 text-sm font-semibold"
          onClick={() => void openView()}
          disabled={opening}
          aria-label={`View ${row.filename}`}
        >
          {opening ? "Opening…" : "View"}
        </button>
      </div>
    </li>
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function mimeForFile(file: File): DocumentMimeType | null {
  if (
    isAllowedDocumentMime(file.type) &&
    mimeMatchesFilename(file.type, file.name)
  ) {
    return file.type;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    return "application/pdf";
  }
  if (ext === "jpg" || ext === "jpeg") {
    return "image/jpeg";
  }
  if (ext === "png") {
    return "image/png";
  }

  return null;
}
