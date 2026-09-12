"use client";

import { useState } from "react";

import { DeskErrorState } from "@/components/desk/error-state";
import { cn } from "@/lib/utils";

export type DeskPreviewState = "off" | "empty" | "loading" | "error";

export function useDeskPreview() {
  const [preview, setPreview] = useState<DeskPreviewState>("off");

  return { preview, setPreview };
}

export function DeskPreviewBar({
  preview,
  onChange,
}: {
  preview: DeskPreviewState;
  onChange: (value: DeskPreviewState) => void;
}) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const options: { id: DeskPreviewState; label: string }[] = [
    { id: "off", label: "Live" },
    { id: "empty", label: "Empty" },
    { id: "loading", label: "Loading" },
    { id: "error", label: "Error" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 text-[0.7rem] text-[var(--desk-ink-muted)]">
      <span className="mr-1 font-semibold tracking-[0.06em] uppercase">
        Preview
      </span>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "desk-focus desk-press inline-flex h-7 items-center rounded-[var(--desk-radius)] border px-2 font-semibold",
            preview === option.id
              ? "border-[var(--desk-accent)] text-[var(--desk-accent)]"
              : "border-[var(--desk-line)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function DeskPreviewError({ onRetry }: { onRetry: () => void }) {
  return (
    <DeskErrorState
      title="The desk could not load"
      body="Something went wrong while fetching this view. Your notes and stage changes are safe — try again."
      onRetry={onRetry}
    />
  );
}
