"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { toastMotion, useDeskMotion } from "@/lib/desk/motion";
import { cn } from "@/lib/utils";

export type DeskToastTone = "info" | "ok" | "warn";

export type DeskToastInput = {
  title: string;
  description?: string;
  tone?: DeskToastTone;
};

type DeskToast = DeskToastInput & { id: string };

type ToastContextValue = {
  toast: (input: DeskToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

export function useDeskToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useDeskToast must be used inside DeskToastProvider");
  }
  return value;
}

export function DeskToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<DeskToast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const { reduce, toast: transition } = useDeskMotion();

  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const timer of map.values()) {
        clearTimeout(timer);
      }
      map.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: DeskToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...input, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS),
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              role={item.tone === "warn" ? "alert" : "status"}
              aria-live={item.tone === "warn" ? "assertive" : "polite"}
              className={cn(
                "pointer-events-auto rounded-[var(--desk-radius)] border px-3 py-2.5 shadow-md",
                item.tone === "ok" &&
                  "border-[var(--desk-ok)]/30 bg-[var(--desk-surface)] text-[var(--desk-ink)]",
                item.tone === "warn" &&
                  "border-[var(--desk-warn)]/40 bg-[var(--desk-surface)] text-[var(--desk-ink)]",
                (!item.tone || item.tone === "info") &&
                  "border-[var(--desk-line)] bg-[var(--desk-surface)] text-[var(--desk-ink)]",
              )}
              {...toastMotion(reduce)}
              transition={transition}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-[0.75rem] text-[var(--desk-ink-muted)]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="desk-focus desk-press -mt-0.5 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--desk-radius)] text-[var(--desk-ink-muted)]"
                  onClick={() => dismiss(item.id)}
                >
                  <X className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Dismiss notification</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
