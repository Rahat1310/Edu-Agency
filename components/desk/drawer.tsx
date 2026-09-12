"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import {
  fadeOverlay,
  slidePanel,
  useDeskMotion,
} from "@/lib/desk/motion";
import { cn } from "@/lib/utils";

type DeskDrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function DeskDrawer({
  open,
  title,
  onClose,
  children,
  footer,
  className,
}: DeskDrawerProps) {
  const { reduce, panel, overlay } = useDeskMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const root = panelRef.current;
    const focusable = root
      ? root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40">
          <motion.button
            type="button"
            aria-label="Close panel"
            className="absolute inset-0 bg-[rgb(26_31_38_/_0.32)]"
            {...fadeOverlay(reduce)}
            transition={overlay}
            onClick={onClose}
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={cn(
              "absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-[var(--desk-line)] bg-[var(--desk-surface)] shadow-[-8px_0_24px_rgb(26_31_38_/_0.08)]",
              className,
            )}
            {...slidePanel(reduce)}
            transition={panel}
          >
            <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--desk-line)] px-4">
              <h2
                id={titleId}
                className="truncate text-sm font-semibold text-[var(--desk-ink)]"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="desk-focus desk-press inline-flex size-8 items-center justify-center rounded-[var(--desk-radius)] text-[var(--desk-ink-muted)]"
              >
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {children}
            </div>
            {footer ? (
              <div className="shrink-0 border-t border-[var(--desk-line)] px-4 py-3">
                {footer}
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
