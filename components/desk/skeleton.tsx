import { cn } from "@/lib/utils";

type DeskSkeletonProps = {
  className?: string;
};

export function DeskSkeleton({ className }: DeskSkeletonProps) {
  return (
    <span
      className={cn(
        "desk-skeleton inline-block rounded-[var(--desk-radius)]",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function DeskTableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  const grid = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };

  return (
    <div role="status" aria-live="polite" aria-label="Loading">
      <span className="sr-only">Loading</span>
      <div className="overflow-hidden rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)]">
        <div
          className="grid gap-3 border-b border-[var(--desk-line)] bg-[var(--desk-surface-muted)] px-3 py-2"
          style={grid}
        >
          {Array.from({ length: columns }, (_, index) => (
            <DeskSkeleton key={`h-${index}`} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, row) => (
          <div
            key={row}
            className="grid gap-3 border-t border-[var(--desk-line)] px-3 py-2.5"
            style={grid}
          >
            {Array.from({ length: columns }, (_, col) => (
              <DeskSkeleton
                key={`${row}-${col}`}
                className={col === 0 ? "h-3 w-28" : "h-3 w-20"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeskDetailSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading lead">
      <span className="sr-only">Loading lead</span>
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-1.5">
            <DeskSkeleton className="h-2.5 w-16" />
            <DeskSkeleton className="h-3.5 w-40" />
          </div>
        ))}
        <DeskMessageThreadSkeleton />
        <DeskAutomationHistorySkeleton />
        <div className="space-y-2 pt-2">
          <DeskSkeleton className="h-2.5 w-20" />
          <DeskSkeleton className="h-16 w-full" />
          <DeskSkeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}

export function DeskMessageThreadSkeleton() {
  return (
    <div
      className="space-y-2"
      role="status"
      aria-live="polite"
      aria-label="Loading messages"
    >
      <span className="sr-only">Loading messages</span>
      <DeskSkeleton className="h-14 w-4/5" />
      <div className="flex justify-end">
        <DeskSkeleton className="h-14 w-3/5" />
      </div>
      <DeskSkeleton className="h-14 w-2/3" />
    </div>
  );
}

export function DeskAutomationHistorySkeleton() {
  return (
    <div
      className="space-y-2"
      role="status"
      aria-live="polite"
      aria-label="Loading reminders and nurture"
    >
      <span className="sr-only">Loading reminders and nurture</span>
      <DeskSkeleton className="h-12 w-full" />
      <DeskSkeleton className="h-12 w-full" />
      <DeskSkeleton className="h-12 w-full" />
    </div>
  );
}

export function DeskVisaSkeleton() {
  return (
    <div
      className="space-y-2"
      role="status"
      aria-live="polite"
      aria-label="Loading visa tracking"
    >
      <span className="sr-only">Loading visa tracking</span>
      <DeskSkeleton className="h-3 w-40" />
      <DeskSkeleton className="h-8 w-full" />
      <DeskSkeleton className="h-8 w-full" />
      <DeskSkeleton className="h-8 w-full" />
      <DeskSkeleton className="h-16 w-full" />
      <DeskSkeleton className="h-8 w-28" />
    </div>
  );
}

export function DeskBoardSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading pipeline"
      className="flex min-h-[calc(100svh-11rem)] gap-2 overflow-hidden"
    >
      <span className="sr-only">Loading pipeline</span>
      {Array.from({ length: 7 }, (_, column) => (
        <div
          key={column}
          className="flex w-[15.5rem] shrink-0 flex-col rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)]"
        >
          <div className="flex items-center justify-between border-b border-[var(--desk-line)] px-2.5 py-2">
            <DeskSkeleton className="h-3 w-16" />
            <DeskSkeleton className="h-3 w-6" />
          </div>
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 3 }, (_, card) => (
              <div
                key={card}
                className="rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] p-2"
              >
                <DeskSkeleton className="h-3.5 w-28" />
                <DeskSkeleton className="mt-2 h-3 w-20" />
                <DeskSkeleton className="mt-3 h-7 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
