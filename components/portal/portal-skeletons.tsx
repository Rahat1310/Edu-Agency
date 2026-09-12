import { DeskSkeleton } from "@/components/desk/skeleton";
import { documentTypeValues } from "@/lib/documents/constants";

export function PortalDashboardSkeleton() {
  return (
    <div
      className="mx-auto max-w-2xl space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading your file"
    >
      <span className="sr-only">Loading your file</span>
      <DeskSkeleton className="h-3 w-24" />
      <DeskSkeleton className="h-9 w-48" />
      <DeskSkeleton className="h-16 w-full" />
      <div className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
        <DeskSkeleton className="h-3 w-28" />
        <DeskSkeleton className="mt-3 h-6 w-56" />
        <DeskSkeleton className="mt-3 h-4 w-full" />
        <DeskSkeleton className="mt-2 h-4 w-5/6" />
      </div>
      <VisaStatusSkeleton />
      <VisaChecklistSkeleton />
      <div className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
        <DeskSkeleton className="h-5 w-40" />
        <DeskSkeleton className="mt-4 h-12 w-full" />
        <DeskSkeleton className="mt-3 h-12 w-full" />
        <DeskSkeleton className="mt-3 h-12 w-full" />
      </div>
      <div className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
        <DeskSkeleton className="h-5 w-56" />
        <DeskSkeleton className="mt-4 h-16 w-full" />
      </div>
    </div>
  );
}

export function VisaStatusSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5"
      role="status"
      aria-live="polite"
      aria-label="Loading visa tracking"
    >
      <span className="sr-only">Loading visa tracking</span>
      <DeskSkeleton className="h-3 w-28" />
      <DeskSkeleton className="mt-3 h-5 w-44" />
      <DeskSkeleton className="mt-3 h-4 w-full" />
      <DeskSkeleton className="mt-2 h-4 w-4/5" />
    </div>
  );
}

export function VisaChecklistSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5"
      role="status"
      aria-live="polite"
      aria-label="Loading your visa checklist"
    >
      <span className="sr-only">Loading your visa checklist</span>
      <DeskSkeleton className="h-2 w-full rounded-full" />
      <DeskSkeleton className="mt-3 h-4 w-64" />
      <DeskSkeleton className="mt-4 h-20 w-full" />
      <DeskSkeleton className="mt-3 h-20 w-full" />
    </div>
  );
}

export function PortalDocumentsSkeleton() {
  return (
    <div
      className="mx-auto max-w-2xl space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading your papers"
    >
      <span className="sr-only">Loading your papers</span>
      <DeskSkeleton className="h-3 w-24" />
      <DeskSkeleton className="h-9 w-64" />
      <DeskSkeleton className="h-16 w-full" />
      {documentTypeValues.map((type) => (
        <div
          key={type}
          className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5"
        >
          <div className="flex items-start justify-between gap-3">
            <DeskSkeleton className="h-5 w-40" />
            <DeskSkeleton className="h-11 w-24 rounded-full" />
          </div>
          <DeskSkeleton className="mt-4 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PortalMatchesSkeleton() {
  return (
    <div
      className="mx-auto max-w-2xl space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading your matches"
    >
      <span className="sr-only">Loading your matches</span>
      <DeskSkeleton className="h-3 w-24" />
      <DeskSkeleton className="h-9 w-72" />
      <DeskSkeleton className="h-16 w-full" />
      <div className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
        <DeskSkeleton className="h-5 w-48" />
        <DeskSkeleton className="mt-3 h-4 w-full" />
        <DeskSkeleton className="mt-4 h-11 w-full" />
        <DeskSkeleton className="mt-3 h-11 w-full" />
      </div>
      <div className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
        <DeskSkeleton className="h-5 w-56" />
        <DeskSkeleton className="mt-3 h-16 w-full" />
      </div>
    </div>
  );
}

export function PortalMatchRankingSkeleton() {
  return (
    <div
      className="mt-4 space-y-3"
      role="status"
      aria-live="polite"
      aria-label="Ranking programs"
    >
      <span className="sr-only">
        Ranking programs. This can take a few seconds.
      </span>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5"
        >
          <DeskSkeleton className="h-3 w-28" />
          <DeskSkeleton className="mt-3 h-6 w-56" />
          <DeskSkeleton className="mt-2 h-4 w-40" />
          <DeskSkeleton className="mt-4 h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
