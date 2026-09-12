import { DeskTableSkeleton } from "@/components/desk/skeleton";

export default function AdminPerformanceLoading() {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
        Performance
      </h1>
      <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
        Loading stats…
      </p>
      <div className="mt-4">
        <DeskTableSkeleton columns={2} rows={7} />
      </div>
    </div>
  );
}
