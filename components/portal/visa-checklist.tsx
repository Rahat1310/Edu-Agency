"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { DeskPreviewBar, useDeskPreview } from "@/components/desk/preview";
import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { PortalErrorState } from "@/components/portal/portal-error-state";
import { VisaChecklistSkeleton } from "@/components/portal/portal-skeletons";
import type { LeadDestinationInterest } from "@/db/schema";
import {
  visaChecklistComingSoonBody,
  visaChecklistLoadErrorBody,
  visaChecklistLoadErrorTitle,
  visaChecklistProgressLine,
  visaChecklistStatusLabels,
} from "@/lib/portal/copy";
import {
  visaChecklistUploadHref,
  type VisaChecklist,
} from "@/lib/visa-requirements/checklist";

export function VisaChecklistSection({
  checklist,
  destination,
  loadError = false,
}: {
  checklist: VisaChecklist;
  destination: LeadDestinationInterest;
  loadError?: boolean;
}) {
  const router = useRouter();
  const { preview, setPreview } = useDeskPreview();
  const showLoading = preview === "loading";
  const showError = preview === "error" || (preview === "off" && loadError);
  const showEmpty =
    preview === "empty" ||
    (preview === "off" && !loadError && checklist.total === 0);

  function onRetry() {
    if (preview === "error") {
      setPreview("off");
      return;
    }

    router.refresh();
  }

  return (
    <section
      className="mt-6 space-y-3"
      aria-labelledby="visa-checklist-heading"
      aria-busy={showLoading || undefined}
    >
      <DeskPreviewBar preview={preview} onChange={setPreview} />
      <h2
        id="visa-checklist-heading"
        className="px-1 text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]"
      >
        Visa checklist
      </h2>
      {showLoading ? (
        <VisaChecklistSkeleton />
      ) : showError ? (
        <PortalErrorState
          title={visaChecklistLoadErrorTitle}
          body={visaChecklistLoadErrorBody}
          onRetry={onRetry}
        />
      ) : showEmpty ? (
        <PortalEmptyState
          title="Checklist coming soon"
          body={visaChecklistComingSoonBody(destination)}
        />
      ) : (
        <ChecklistBody checklist={checklist} />
      )}
    </section>
  );
}

function ChecklistBody({ checklist }: { checklist: VisaChecklist }) {
  const progressLine = visaChecklistProgressLine(
    checklist.submittedCount,
    checklist.total,
  );
  const progressId = "visa-checklist-progress";
  const percent =
    checklist.total === 0
      ? 0
      : Math.round((checklist.submittedCount / checklist.total) * 100);

  return (
    <div className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
      <div
        role="progressbar"
        aria-labelledby="visa-checklist-heading"
        aria-valuemin={0}
        aria-valuemax={checklist.total}
        aria-valuenow={checklist.submittedCount}
        aria-valuetext={progressLine}
        className="h-2 overflow-hidden rounded-full bg-[var(--desk-surface-muted)]"
      >
        <div
          className="h-full rounded-full bg-[var(--desk-accent-2)]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p
        id={progressId}
        className="mt-3 text-[0.95rem] leading-6 text-[var(--desk-ink)]"
      >
        {progressLine}
      </p>
      <ol className="mt-4 space-y-3" aria-describedby={progressId}>
        {checklist.items.map((item) => {
          const needsUpload =
            item.status === "missing" || item.status === "rejected";

          return (
            <li key={item.id}>
              <article className="rounded-xl border border-[var(--desk-line)] bg-[var(--desk-bg)] px-4 py-4">
                <h3 className="text-base font-semibold text-[var(--desk-accent)]">
                  {item.documentName}
                </h3>
                {item.description ? (
                  <p className="mt-1 text-sm leading-6 text-[var(--desk-ink-muted)]">
                    {item.description}
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-medium text-[var(--desk-ink)]">
                  {visaChecklistStatusLabels[item.status]}
                </p>
                {needsUpload ? (
                  <Link
                    href={visaChecklistUploadHref(item.documentTypeKey)}
                    className="desk-focus desk-press mt-3 inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] bg-[var(--desk-surface)] px-4 text-sm font-semibold text-[var(--desk-ink)]"
                  >
                    {item.status === "rejected"
                      ? "Upload a new file"
                      : "Upload this document"}
                  </Link>
                ) : (
                  <Link
                    href={visaChecklistUploadHref(item.documentTypeKey)}
                    className="desk-focus mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-green)]"
                  >
                    See in your papers
                  </Link>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
