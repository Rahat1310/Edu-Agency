type DeskErrorStateProps = {
  title: string;
  body: string;
  onRetry: () => void;
};

export function DeskErrorState({ title, body, onRetry }: DeskErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-[var(--desk-radius)] border border-[var(--desk-warn)]/40 bg-[var(--desk-surface)] px-4 py-10 text-center"
    >
      <h2 className="text-sm font-semibold text-[var(--desk-ink)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--desk-ink-muted)]">
        {body}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="desk-focus desk-press mt-4 inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-3 text-xs font-semibold"
      >
        Try again
      </button>
    </div>
  );
}
