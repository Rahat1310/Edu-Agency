"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { LeadForm, type LeadFormCopy } from "@/components/lead-form";
import {
  MarketingPreviewBar,
  useMarketingPreview,
} from "@/components/marketing/preview";
import type { ChatApiResult } from "@/lib/ai/chat-types";
import { useDeskMotion } from "@/lib/desk/motion";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export type ChatWidgetCopy = Dictionary["chatbot"];

type ChatWidgetProps = {
  locale: Locale;
  copy: ChatWidgetCopy;
  leadCopy: LeadFormCopy;
  whatsappHref: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export function ChatWidget({
  locale,
  copy,
  leadCopy,
  whatsappHref,
}: ChatWidgetProps) {
  const { reduce, panel, overlay } = useDeskMotion();
  const { preview, setPreview } = useMarketingPreview();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerLead, setOfferLead] = useState(false);
  const [leadPrefill, setLeadPrefill] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "greeting", role: "assistant", text: copy.greeting },
  ]);

  const panelRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const subtitleId = useId();
  const panelId = useId();
  const inputId = useId();

  const showTyping = pending || preview === "loading";
  const showUnavailablePreview = preview === "error";
  const showHandoff = offerLead || showUnavailablePreview;

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [messages, offerLead, showTyping, showHandoff]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    const launcherButton = launcherRef.current;
    const root = panelRef.current;

    function onDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !root) {
        return;
      }

      const focusable = [
        ...root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onDocumentKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onDocumentKeyDown);
      if (previouslyFocused && previouslyFocused !== launcherButton) {
        previouslyFocused.focus();
      } else {
        launcherButton?.focus();
      }
    };
  }, [open]);

  function handoffToCounselor() {
    setError(null);
    setOfferLead(true);
    setMessages((current) => [
      ...current,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: copy.unavailable,
      },
    ]);
  }

  async function sendMessage(raw: string) {
    const text = raw.trim();
    if (!text || pending) {
      return;
    }

    const userId = `user-${Date.now()}`;
    setMessages((current) => [...current, { id: userId, role: "user", text }]);
    setDraft("");
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, locale }),
      });

      let result: ChatApiResult;
      try {
        result = (await response.json()) as ChatApiResult;
      } catch {
        handoffToCounselor();
        return;
      }

      if (!result.ok) {
        if (result.code === "rate_limit") {
          setError(copy.rateLimitError);
          return;
        }

        handoffToCounselor();
        return;
      }

      const reply = result.offerLead
        ? result.text || copy.handoff
        : result.text;

      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", text: reply },
      ]);

      if (result.offerLead) {
        setOfferLead(true);
        setLeadPrefill((current) => current || text);
      }
    } catch {
      handoffToCounselor();
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function onComposerKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              key="chat-overlay"
              type="button"
              aria-label={copy.close}
              className="pointer-events-auto fixed inset-0 z-40 bg-[var(--brand-navy)]/25 md:hidden"
              initial={reduce ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0 }}
              transition={overlay}
              onClick={() => setOpen(false)}
            />
            <motion.section
              key="chat-panel"
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={subtitleId}
              className="pointer-events-auto relative z-40 flex h-[min(32rem,calc(100svh-6.5rem))] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-[0_20px_60px_rgba(11,30,54,0.22)] ring-1 ring-black/5 backdrop-blur-2xl"
              initial={
                reduce
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 16, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduce
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12, scale: 0.98 }
              }
              transition={panel}
            >
              <header className="flex shrink-0 items-center justify-between gap-3 border-b border-orange-500/20 bg-slate-900 px-5 py-3.5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
                    <Image
                      src="/logo.png"
                      alt="Study Abroad Consultancy"
                      width={36}
                      height={24}
                      className="size-7 object-contain"
                    />
                  </div>
                  <div>
                    <h2
                      id={titleId}
                      className="font-display text-base font-bold tracking-[-0.03em]"
                    >
                      {copy.title}
                    </h2>
                    <p
                      id={subtitleId}
                      className="mt-0.5 text-xs leading-4 text-slate-300"
                    >
                      {copy.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="focus-ring-dark inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
                >
                  <X className="size-4" aria-hidden="true" />
                  <span className="sr-only">{copy.close}</span>
                </button>
              </header>

              <div
                ref={listRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-3"
              >
                <MarketingPreviewBar preview={preview} onChange={setPreview} />
                <div
                  role="log"
                  aria-live="polite"
                  aria-relevant="additions"
                  aria-busy={showTyping}
                  aria-label={copy.messagesAria}
                >
                  <ul className="list-none space-y-3">
                    {messages.map((message) => (
                      <li key={message.id}>
                        <p
                          className={cn(
                            "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-2xs",
                            message.role === "user"
                              ? "btn-sunset ml-auto rounded-tr-xs text-white"
                              : "mr-auto rounded-tl-xs border border-stone-200 bg-white text-slate-800 shadow-2xs",
                          )}
                        >
                          <span className="sr-only">
                            {message.role === "user"
                              ? copy.you
                              : copy.assistant}
                            :{" "}
                          </span>
                          {message.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                {showTyping ? <TypingIndicator label={copy.typing} /> : null}
                {showUnavailablePreview ? (
                  <p className="mr-auto max-w-[90%] rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800">
                    <span className="sr-only">{copy.assistant}: </span>
                    {copy.unavailable}
                  </p>
                ) : null}
                {error ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-600"
                  >
                    {error}
                  </p>
                ) : null}
                {showHandoff ? (
                  <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-2xs">
                    <p className="text-sm leading-6 text-slate-800">
                      {copy.unavailableHint}
                    </p>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-sunset focus-ring mt-3 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold text-white shadow-md hover:scale-[1.02]"
                    >
                      {copy.counselorCta}
                    </a>
                    <div className="mt-4">
                      <LeadForm
                        copy={leadCopy}
                        source="chatbot"
                        heading={copy.formHeading}
                        intro={copy.formIntro}
                        defaultMessage={leadPrefill}
                        compact
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <form
                onSubmit={onSubmit}
                aria-busy={pending}
                className="flex shrink-0 items-end gap-2 border-t border-stone-200 bg-white p-3"
              >
                <label htmlFor={inputId} className="sr-only">
                  {copy.placeholder}
                </label>
                <textarea
                  id={inputId}
                  ref={inputRef}
                  rows={2}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={onComposerKeyDown}
                  placeholder={copy.placeholder}
                  className="focus-ring max-h-28 min-h-12 flex-1 resize-none rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={pending || draft.trim().length === 0}
                  className="btn-sunset focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white shadow-md disabled:opacity-40"
                >
                  <Send className="size-4" aria-hidden="true" />
                  <span className="sr-only">{copy.send}</span>
                </button>
              </form>
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>

      {/* AI Assistant Chat Trigger */}
      <div className="group pointer-events-auto relative">
        <button
          ref={launcherRef}
          type="button"
          className="btn-sunset focus-ring relative inline-flex size-13 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(255,69,0,0.35)] ring-4 ring-orange-400/20 transition-all hover:scale-105 active:scale-95"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? panelId : undefined}
          aria-label={open ? copy.launcherClose : copy.launcherOpen}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? (
            <X
              className="size-6 rotate-90 transition-transform"
              aria-hidden="true"
            />
          ) : (
            <MessageCircle
              className="size-6 transition-transform"
              aria-hidden="true"
            />
          )}
        </button>

        {/* Tooltip on hover (when not open) */}
        {!open ? (
          <span className="pointer-events-none absolute top-1/2 right-full mr-3 hidden -translate-y-1/2 items-center gap-1.5 rounded-full border border-stone-200/90 bg-white/95 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-slate-800 shadow-lg backdrop-blur-md group-hover:inline-flex">
            <span className="size-2 animate-pulse rounded-full bg-orange-500" />
            {locale === "bn" ? "এআই সহকারী" : "AI Assistant"}
          </span>
        ) : null}
      </div>

      {/* Floating WhatsApp Action Button */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="group focus-ring pointer-events-auto relative inline-flex size-13 items-center justify-center rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.4)] ring-4 ring-emerald-400/20 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label={
          locale === "bn" ? "হোয়াটসঅ্যাপে সরাসরি কথা বলুন" : "Chat on WhatsApp"
        }
      >
        {/* Subtle Online Status Dot */}
        <span className="absolute top-0.5 right-0.5 flex size-3 items-center justify-center">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full border border-white bg-emerald-400 shadow-xs" />
        </span>

        {/* WhatsApp Official Icon */}
        <WhatsAppIcon className="size-6 fill-white transition-transform duration-300 group-hover:scale-110" />

        {/* Slide-out tooltip on hover */}
        <span className="pointer-events-none absolute top-1/2 right-full mr-3 hidden -translate-y-1/2 items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/95 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-slate-800 shadow-lg backdrop-blur-md transition-all group-hover:inline-flex">
          <span className="size-2 rounded-full bg-emerald-500" />
          {locale === "bn" ? "হোয়াটসঅ্যাপে পরামর্শ নিন" : "Chat on WhatsApp"}
        </span>
      </a>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? "size-7"}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="mr-auto flex max-w-[90%] items-center rounded-2xl border border-[var(--border)] bg-white px-3 py-3"
    >
      <span className="sr-only">{label}</span>
      <span className="chat-typing" aria-hidden="true">
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
      </span>
    </div>
  );
}
