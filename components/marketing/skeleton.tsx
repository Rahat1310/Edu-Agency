import type { ReactNode } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { cn } from "@/lib/utils";

type MarketingSkeletonProps = {
  className?: string;
};

export function MarketingSkeleton({ className }: MarketingSkeletonProps) {
  return (
    <span
      className={cn("marketing-skeleton inline-block rounded-md", className)}
      aria-hidden="true"
    />
  );
}

function StatusFrame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={className}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function CostCalculatorSkeleton({ label }: { label: string }) {
  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <StatusFrame label={label}>
          <MarketingSkeleton className="h-3 w-20" />
          <MarketingSkeleton className="mt-4 h-12 w-full max-w-xl" />
          <MarketingSkeleton className="mt-4 h-16 w-full max-w-2xl" />
          <div className="mt-10 grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
            <MarketingSkeleton className="h-11 w-full" />
            <MarketingSkeleton className="h-11 w-full" />
            <MarketingSkeleton className="h-11 w-full" />
            <MarketingSkeleton className="h-11 w-full rounded-full" />
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <MarketingSkeleton className="h-48 w-full rounded-2xl" />
            <MarketingSkeleton className="h-48 w-full rounded-2xl" />
          </div>
        </StatusFrame>
      </PageShell>
    </section>
  );
}

export function CostCalculatorResultSkeleton({ label }: { label: string }) {
  return (
    <StatusFrame label={label} className="mt-10 grid gap-6 lg:grid-cols-2">
      <MarketingSkeleton className="h-48 w-full rounded-2xl" />
      <MarketingSkeleton className="h-64 w-full rounded-2xl" />
    </StatusFrame>
  );
}

export function ProgramCompareSkeleton({ label }: { label: string }) {
  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <StatusFrame label={label}>
          <MarketingSkeleton className="h-4 w-28" />
          <MarketingSkeleton className="mt-6 h-3 w-20" />
          <MarketingSkeleton className="mt-4 h-12 w-full max-w-xl" />
          <MarketingSkeleton className="mt-4 h-16 w-full max-w-2xl" />
          <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
            <div className="grid grid-cols-4 gap-3 border-b border-[var(--border)] bg-[var(--brand-sky)] px-4 py-3">
              <MarketingSkeleton className="h-3 w-16" />
              <MarketingSkeleton className="h-8 w-32" />
              <MarketingSkeleton className="h-8 w-32" />
              <MarketingSkeleton className="h-8 w-32" />
            </div>
            {Array.from({ length: 6 }, (_, row) => (
              <div
                key={row}
                className="grid grid-cols-4 gap-3 border-t border-[var(--border)] px-4 py-3"
              >
                <MarketingSkeleton className="h-4 w-24" />
                <MarketingSkeleton className="h-4 w-28" />
                <MarketingSkeleton className="h-4 w-28" />
                <MarketingSkeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </StatusFrame>
      </PageShell>
    </section>
  );
}

export function ProgramCompareTableSkeleton({ label }: { label: string }) {
  return (
    <StatusFrame
      label={label}
      className="mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-white"
    >
      <div className="grid grid-cols-4 gap-3 border-b border-[var(--border)] bg-[var(--brand-sky)] px-4 py-3">
        <MarketingSkeleton className="h-3 w-16" />
        <MarketingSkeleton className="h-8 w-32" />
        <MarketingSkeleton className="h-8 w-32" />
        <MarketingSkeleton className="h-8 w-32" />
      </div>
      {Array.from({ length: 6 }, (_, row) => (
        <div
          key={row}
          className="grid grid-cols-4 gap-3 border-t border-[var(--border)] px-4 py-3"
        >
          <MarketingSkeleton className="h-4 w-24" />
          <MarketingSkeleton className="h-4 w-28" />
          <MarketingSkeleton className="h-4 w-28" />
          <MarketingSkeleton className="h-4 w-28" />
        </div>
      ))}
    </StatusFrame>
  );
}

export function SuccessStoriesSkeleton({ label }: { label: string }) {
  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <StatusFrame label={label}>
          <MarketingSkeleton className="h-3 w-24" />
          <MarketingSkeleton className="mt-4 h-12 w-full max-w-xl" />
          <MarketingSkeleton className="mt-4 h-16 w-full max-w-2xl" />
          <div className="mt-10 flex flex-wrap gap-2">
            <MarketingSkeleton className="h-11 w-32 rounded-full" />
            <MarketingSkeleton className="h-11 w-24 rounded-full" />
            <MarketingSkeleton className="h-11 w-24 rounded-full" />
            <MarketingSkeleton className="h-11 w-28 rounded-full" />
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <MarketingSkeleton className="h-56 w-full rounded-2xl" />
            <MarketingSkeleton className="h-56 w-full rounded-2xl" />
          </div>
        </StatusFrame>
      </PageShell>
    </section>
  );
}

export function SuccessStoriesGridSkeleton({ label }: { label: string }) {
  return (
    <StatusFrame label={label} className="mt-8 grid gap-5 sm:grid-cols-2">
      <MarketingSkeleton className="h-56 w-full rounded-2xl" />
      <MarketingSkeleton className="h-56 w-full rounded-2xl" />
    </StatusFrame>
  );
}

export function DestinationPageSkeleton({ label }: { label: string }) {
  return (
    <section className="pt-10 pb-12 sm:pt-16 sm:pb-16">
      <PageShell>
        <StatusFrame label={label}>
          <MarketingSkeleton className="h-3 w-40" />
          <MarketingSkeleton className="mt-4 h-12 w-full max-w-3xl" />
          <MarketingSkeleton className="mt-6 h-16 w-full max-w-2xl" />
          <MarketingSkeleton className="mt-8 h-24 w-full rounded-2xl" />
        </StatusFrame>
      </PageShell>
    </section>
  );
}

export function DestinationCountdownSkeleton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <StatusFrame label={label} className={className}>
      <MarketingSkeleton className="h-24 w-full rounded-2xl" />
    </StatusFrame>
  );
}
