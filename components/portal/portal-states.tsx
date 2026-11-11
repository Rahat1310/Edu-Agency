export function PortalPending() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-8 text-center">
      <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-[var(--desk-accent)]">
        We&apos;re matching your file by hand
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--desk-ink-muted)]">
        We found an existing enquiry that needs an ownership check, or multiple
        enquiries using this number. A counsellor will verify and link the
        correct file. Your documents stay private while this is checked. Contact
        the office if you need help continuing.
      </p>
    </div>
  );
}

export function PortalProvisioning() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-8 text-center">
      <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-[var(--desk-accent)]">
        Opening your file
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--desk-ink-muted)]">
        This usually takes a few seconds. Refresh if it stays here — or WhatsApp
        us and we&apos;ll finish it on our side.
      </p>
    </div>
  );
}
