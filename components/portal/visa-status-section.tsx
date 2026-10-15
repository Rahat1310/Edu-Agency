"use client";
import { useRouter } from "next/navigation";
import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { PortalErrorState } from "@/components/portal/portal-error-state";
import type { LeadStatus } from "@/db/schema";
import {
  visaStatusEmptyBody,
  visaStatusEmptyTitle,
  visaStatusLoadErrorBody,
  visaStatusLoadErrorTitle,
} from "@/lib/portal/copy";
import { isVisaPipelineStage } from "@/lib/visa-applications/stage";
export function VisaStatusSection({
  status,
  visaLine,
  loadError = false,
}: {
  status: LeadStatus;
  visaLine: string | null;
  loadError?: boolean;
}) {
  const router = useRouter();
  const inVisaStage = isVisaPipelineStage(status);
  function onRetry() {
    router.refresh();
  }
  if (!inVisaStage && !loadError) {
    return null;
  }
  const showError = loadError;
  const showEmpty = !loadError && !visaLine;
  if (!inVisaStage && !loadError) {
    return <div className="mt-6"></div>;
  }
  return (
    <section
      className="mt-6 space-y-3"
      aria-labelledby="visa-status-heading"
      aria-busy={undefined}
    >
      <h2
        id="visa-status-heading"
        className="px-1 text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]"
      >
        Visa tracking
      </h2>
      {showError ? (
        <PortalErrorState
          title={visaStatusLoadErrorTitle}
          body={visaStatusLoadErrorBody}
          onRetry={onRetry}
        />
      ) : showEmpty ? (
        <PortalEmptyState
          title={visaStatusEmptyTitle}
          body={visaStatusEmptyBody}
        />
      ) : (
        <div className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
          <p
            className="text-[0.95rem] leading-6 text-[var(--desk-ink)]"
            aria-live="polite"
            aria-atomic="true"
          >
            {visaLine}
          </p>
        </div>
      )}
    </section>
  );
}
