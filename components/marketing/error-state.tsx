import { cn } from "@/lib/utils";

type MarketingErrorStateProps = {
  title: string;
  body: string;
  retryLabel: string;
  onRetry: () => void;
  className?: string;
};

export function MarketingErrorState({
  title,
  body,
  retryLabel,
  onRetry,
  className,
}: MarketingErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border border-[var(--destructive)]/30 bg-white px-5 py-10 text-center",
        className,
      )}
    >
      <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-[var(--brand-navy)]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
        {body}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="focus-ring mt-5 inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-[var(--brand-sky)] px-4 text-sm font-bold text-[var(--brand-navy)]"
      >
        {retryLabel}
      </button>
    </div>
  );
}
