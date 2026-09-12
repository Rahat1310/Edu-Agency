import type { ReactNode } from "react";

type DeskEmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function DeskEmptyState({ title, body, action }: DeskEmptyStateProps) {
  return (
    <div className="rounded-[var(--desk-radius)] border border-dashed border-[var(--desk-line)] bg-[var(--desk-surface)] px-4 py-10 text-center">
      <h2 className="text-sm font-semibold text-[var(--desk-ink)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--desk-ink-muted)]">
        {body}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
