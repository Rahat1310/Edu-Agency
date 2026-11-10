"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteLead } from "@/app/admin/leads/actions";

type LeadDeleteButtonProps = {
  leadId: string;
  name: string;
  returnHref?: string;
};

export function LeadDeleteButton({
  leadId,
  name,
  returnHref,
}: LeadDeleteButtonProps) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (confirmOpen && !dialog?.open) dialog?.showModal();
    if (!confirmOpen && dialog?.open) dialog.close();
  }, [confirmOpen]);

  function runDelete() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteLead({ leadId });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setConfirmOpen(false);
        if (returnHref) router.replace(returnHref, { scroll: false });
        router.refresh();
      } catch {
        setError("The lead could not be deleted. Please try again.");
      }
    });
  }

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        disabled={pending}
        aria-label={`Delete lead ${name}`}
        onClick={() => {
          setError(null);
          setConfirmOpen(true);
        }}
        className="desk-focus inline-flex min-h-9 items-center rounded px-3 text-xs font-semibold text-[var(--destructive)] hover:bg-[var(--destructive)]/8 disabled:opacity-50"
      >
        Delete
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        onClose={() => setConfirmOpen(false)}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-6 text-left text-slate-900 shadow-xl backdrop:bg-black/40"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          Delete this lead?
        </h2>
        <p id={descriptionId} className="mt-3 text-sm leading-6">
          This will permanently delete <strong>{name}</strong> and their notes,
          messages, assessment, linked application, and uploaded documents. This
          cannot be undone.
        </p>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-[var(--destructive)]">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            disabled={pending}
            onClick={() => setConfirmOpen(false)}
            className="desk-focus min-h-10 rounded border border-slate-300 px-4 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={runDelete}
            className="desk-focus min-h-10 rounded bg-[var(--destructive)] px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Delete lead"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
