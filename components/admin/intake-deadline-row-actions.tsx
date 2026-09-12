"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { deleteIntakeDeadline } from "@/app/admin/intake-deadlines/actions";

type IntakeDeadlineRowActionsProps = {
  id: string;
  intakeLabel: string;
};

export function IntakeDeadlineRowActions({
  id,
  intakeLabel,
}: IntakeDeadlineRowActionsProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (confirmOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!confirmOpen && dialog.open) {
      dialog.close();
    }
  }, [confirmOpen]);

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteIntakeDeadline({ id });
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
        className="focus-ring inline-flex min-h-10 items-center rounded-full px-3 text-xs font-bold text-[var(--destructive)] hover:bg-[var(--destructive)]/8 disabled:opacity-60"
      >
        Delete
      </button>
      {error ? (
        <p className="basis-full text-right text-xs text-[var(--destructive)]">
          {error}
        </p>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-labelledby={`delete-deadline-${id}`}
        onClose={() => setConfirmOpen(false)}
        className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-white p-6 text-[var(--brand-ink)] shadow-[0_18px_50px_rgb(18_53_91_/_0.18)]"
      >
        <h2
          id={`delete-deadline-${id}`}
          className="font-display text-xl font-bold text-[var(--brand-navy)]"
        >
          Delete this deadline?
        </h2>
        <p className="mt-3 text-sm leading-6">
          This will permanently remove{" "}
          <span className="font-semibold">{intakeLabel}</span>. The public
          countdown will use the next upcoming date for that destination, or
          hide if none remains.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmOpen(false)}
            className="focus-ring inline-flex min-h-11 items-center rounded-full border border-[var(--border)] px-4 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={runDelete}
            className="focus-ring inline-flex min-h-11 items-center rounded-full bg-[var(--destructive)] px-4 text-sm font-bold text-white"
          >
            {pending ? "Deleting…" : "Delete deadline"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
