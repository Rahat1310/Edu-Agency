import { DeskBoardSkeleton } from "@/components/desk/skeleton";

export default function AdminPipelineLoading() {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
        Pipeline Board
      </h1>
      <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
        Loading the board…
      </p>
      <div className="mt-4">
        <DeskBoardSkeleton />
      </div>
    </div>
  );
}
