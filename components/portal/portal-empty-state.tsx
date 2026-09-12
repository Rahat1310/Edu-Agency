import type { ReactNode } from "react";

type PortalEmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function PortalEmptyState({
  title,
  body,
  action,
}: PortalEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-8">
      <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
        {title}
      </h2>
      <p className="mt-2 text-[0.95rem] leading-6 text-[var(--desk-ink-muted)]">
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
