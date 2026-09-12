"use client";

import { useEffect, useRef } from "react";

import { DeskEmptyState } from "@/components/desk/empty-state";
import { DeskErrorState } from "@/components/desk/error-state";
import { DeskPreviewBar, useDeskPreview } from "@/components/desk/preview";
import { DeskMessageThreadSkeleton } from "@/components/desk/skeleton";
import { formatLeadDate } from "@/lib/leads/labels";
import {
  threadChannelLabels,
  threadMessageAriaLabel,
} from "@/lib/messages/labels";
import type { DeskThreadMessage } from "@/lib/messages/types";
import { cn } from "@/lib/utils";

type MessageThreadProps = {
  messages: DeskThreadMessage[];
};

export function MessageThread({ messages }: MessageThreadProps) {
  const { preview, setPreview } = useDeskPreview();
  const endRef = useRef<HTMLLIElement>(null);
  const showLoading = preview === "loading";
  const showEmpty =
    preview === "empty" || (preview === "off" && messages.length === 0);
  const showError = preview === "error";

  useEffect(() => {
    if (showLoading || showEmpty || showError) {
      return;
    }

    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length, showEmpty, showError, showLoading]);

  return (
    <section
      aria-labelledby="lead-messages-heading"
      aria-busy={showLoading || undefined}
    >
      <h3
        id="lead-messages-heading"
        className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase"
      >
        Messages
      </h3>
      <div className="mt-2">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
      </div>
      <div className="mt-2">
        {showLoading ? (
          <DeskMessageThreadSkeleton />
        ) : showError ? (
          <DeskErrorState
            title="Messages could not load"
            body="The rest of this file is still here. Try again."
            onRetry={() => setPreview("off")}
          />
        ) : showEmpty ? (
          <DeskEmptyState
            title="No messages yet"
            body="WhatsApp and Messenger replies land here in one thread, oldest first. Email follow-ups stay in reminders and nurture below."
          />
        ) : (
          <ol
            className="space-y-2"
            aria-label="WhatsApp and Messenger thread, oldest first"
          >
            {messages.map((message, index) => (
              <li
                key={message.id}
                ref={index === messages.length - 1 ? endRef : undefined}
              >
                <ThreadBubble message={message} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function ThreadBubble({ message }: { message: DeskThreadMessage }) {
  const outbound = message.direction === "outbound";
  const channel = threadChannelLabels[message.channel];
  const direction = outbound ? "Sent" : "Received";

  return (
    <article className={cn("flex", outbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] rounded-[var(--desk-radius)] border px-2.5 py-2",
          outbound
            ? "border-[var(--desk-accent)]/25 bg-[var(--desk-surface-muted)]"
            : "border-[var(--desk-line)] bg-[var(--desk-bg)]",
        )}
      >
        <p className="sr-only">{threadMessageAriaLabel(message)}</p>
        <p
          className="text-[0.65rem] font-semibold tracking-[0.06em] text-[var(--desk-accent)] uppercase"
          aria-hidden="true"
        >
          {channel}
          <span className="mx-1 font-medium tracking-normal text-[var(--desk-ink-muted)]">
            ·
          </span>
          <span className="font-medium tracking-normal text-[var(--desk-ink-muted)] normal-case">
            {direction}
          </span>
        </p>
        <p className="mt-1 text-sm whitespace-pre-wrap" aria-hidden="true">
          {message.body || "—"}
        </p>
        <p
          className="mt-1 text-[0.7rem] text-[var(--desk-ink-muted)]"
          aria-hidden="true"
        >
          <time dateTime={message.createdAt}>
            {formatLeadDate(message.createdAt)}
          </time>
        </p>
      </div>
    </article>
  );
}
