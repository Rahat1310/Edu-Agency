type PortalErrorStateProps = {
  title: string;
  body: string;
  onRetry: () => void;
};

export function PortalErrorState({
  title,
  body,
  onRetry,
}: PortalErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-[var(--desk-warn)]/40 bg-[var(--desk-surface)] px-5 py-8"
    >
      <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
        {title}
      </h2>
      <p className="mt-2 text-[0.95rem] leading-6 text-[var(--desk-ink-muted)]">
        {body}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="desk-focus desk-press mt-5 inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] bg-[var(--desk-bg)] px-4 text-sm font-semibold"
      >
        Try again
      </button>
    </div>
  );
}
