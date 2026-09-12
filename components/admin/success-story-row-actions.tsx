"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  deleteSuccessStory,
  setSuccessStoryPublished,
} from "@/app/admin/success-stories/actions";

type SuccessStoryRowActionsProps = {
  id: string;
  studentName: string;
  isPublished: boolean;
};

export function SuccessStoryRowActions({
  id,
  studentName,
  isPublished,
}: SuccessStoryRowActionsProps) {
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

  function runPublish(next: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await setSuccessStoryPublished({ id, isPublished: next });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSuccessStory({ id });
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
        onClick={() => runPublish(!isPublished)}
        className="focus-ring inline-flex min-h-10 items-center rounded-full border border-[var(--border)] bg-white px-3 text-xs font-bold text-[var(--brand-navy)] hover:border-[var(--brand-blue)] disabled:opacity-60"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </button>
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
        aria-labelledby={`delete-story-${id}`}
        onClose={() => setConfirmOpen(false)}
        className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-white p-6 text-[var(--brand-ink)] shadow-[0_18px_50px_rgb(18_53_91_/_0.18)]"
      >
        <h2
          id={`delete-story-${id}`}
          className="font-display text-xl font-bold text-[var(--brand-navy)]"
        >
          Delete this story?
        </h2>
        <p className="mt-3 text-sm leading-6">
          This will permanently remove the story from{" "}
          <span className="font-semibold">{studentName}</span>. This cannot be
          undone.
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
            {pending ? "Deleting…" : "Delete story"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
