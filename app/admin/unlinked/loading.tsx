import { DeskTableSkeleton } from "@/components/desk/skeleton";

export default function AdminUnlinkedLoading() {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
        Unlinked accounts
      </h1>
      <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
        Loading the queue…
      </p>
      <div className="mt-4">
        <DeskTableSkeleton columns={4} rows={4} />
      </div>
    </div>
  );
}
