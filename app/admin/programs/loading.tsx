import { DeskTableSkeleton } from "@/components/desk/skeleton";

export default function AdminProgramsLoading() {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
        Programs
      </h1>
      <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
        Loading programs…
      </p>
      <div className="mt-4">
        <DeskTableSkeleton columns={6} rows={8} />
      </div>
    </div>
  );
}
