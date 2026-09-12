"use client";

import { useState, type ReactNode } from "react";

import { DeskDrawer } from "@/components/desk/drawer";

export function PortalInfoDrawer({
  triggerLabel,
  title,
  children,
}: {
  triggerLabel: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="desk-focus desk-press inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] bg-[var(--desk-surface)] px-4 text-sm font-semibold text-[var(--desk-ink)]"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>
      <DeskDrawer open={open} title={title} onClose={() => setOpen(false)}>
        <div className="space-y-3 text-[0.95rem] leading-6 text-[var(--desk-ink)]">
          {children}
        </div>
      </DeskDrawer>
    </>
  );
}
