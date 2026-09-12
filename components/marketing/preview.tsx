"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export type MarketingPreviewState = "off" | "empty" | "loading" | "error";

export function useMarketingPreview() {
  const [preview, setPreview] = useState<MarketingPreviewState>("off");

  return { preview, setPreview };
}

export function MarketingPreviewBar({
  preview,
  onChange,
}: {
  preview: MarketingPreviewState;
  onChange: (value: MarketingPreviewState) => void;
}) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const options: { id: MarketingPreviewState; label: string }[] = [
    { id: "off", label: "Live" },
    { id: "empty", label: "Empty" },
    { id: "loading", label: "Loading" },
    { id: "error", label: "Error" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 text-[0.7rem] text-[var(--muted-foreground)]">
      <span className="mr-1 font-semibold tracking-[0.06em] uppercase">
        Preview
      </span>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "focus-ring inline-flex h-7 items-center rounded-md border px-2 font-semibold",
            preview === option.id
              ? "border-[var(--brand-blue)] text-[var(--brand-blue)]"
              : "border-[var(--border)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
