import { DeskTableSkeleton } from "@/components/desk/skeleton";

export default function AdminIntakeDeadlinesLoading() {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
        Intake deadlines
      </h1>
      <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
        Loading deadlines…
      </p>
      <div className="mt-4">
        <DeskTableSkeleton columns={5} rows={8} />
      </div>
    </div>
  );
}
