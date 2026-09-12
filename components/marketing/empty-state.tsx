import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarketingEmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
};

export function MarketingEmptyState({
  title,
  body,
  action,
  className,
}: MarketingEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[var(--border)] bg-white px-5 py-10 text-center",
        className,
      )}
    >
      <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-[var(--brand-navy)]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
