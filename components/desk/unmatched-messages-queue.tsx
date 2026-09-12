"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { linkUnmatchedMessage } from "@/app/admin/unmatched-messages/actions";
import { DeskEmptyState } from "@/components/desk/empty-state";
import {
  DeskPreviewBar,
  DeskPreviewError,
  useDeskPreview,
} from "@/components/desk/preview";
import { DeskTableSkeleton } from "@/components/desk/skeleton";
import { useDeskToast } from "@/components/desk/toast";
import {
  formatLeadDate,
  leadDestinationLabels,
  leadStatusLabels,
} from "@/lib/leads/labels";
import { threadChannelLabels } from "@/lib/messages/labels";
import { mergeLeadOptions } from "@/lib/messages/suggestions";
import type { DeskLeadMatch, UnmatchedMessageRow } from "@/lib/messages/types";

const SEARCH_DEBOUNCE_MS = 300;

type UnmatchedMessagesQueueProps = {
  rows: UnmatchedMessageRow[];
  searchQuery: string;
  searchedLeads: DeskLeadMatch[];
};

export function UnmatchedMessagesQueue({
  rows,
  searchQuery,
  searchedLeads,
}: UnmatchedMessagesQueueProps) {
  const router = useRouter();
  const { toast } = useDeskToast();
  const { preview, setPreview } = useDeskPreview();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchQuery);

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (search === searchQuery) {
      return;
    }

    const handle = window.setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        const next = search.trim();
        if (next) {
          params.set("q", next);
        }
        const qs = params.toString();
        router.replace(
          qs ? `/admin/unmatched-messages?${qs}` : "/admin/unmatched-messages",
          { scroll: false },
        );
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [router, search, searchQuery]);

  const showLoading = pending || preview === "loading";
  const showEmpty =
    preview === "empty" || (preview === "off" && rows.length === 0);

  function link(messageId: string, leadId: string) {
    startTransition(async () => {
      const result = await linkUnmatchedMessage({ messageId, leadId });
      if (!result.ok) {
        toast({ title: result.message, tone: "warn" });
        return;
      }
      toast({ title: "Message linked to lead", tone: "ok" });
      router.refresh();
    });
  }

  if (preview === "error") {
    return (
      <div className="space-y-3">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <DeskPreviewError onRetry={() => setPreview("off")} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DeskPreviewBar preview={preview} onChange={setPreview} />
      <form
        className="rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] p-3"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(() => {
            const params = new URLSearchParams();
            const next = search.trim();
            if (next) {
              params.set("q", next);
            }
            const qs = params.toString();
            router.replace(
              qs
                ? `/admin/unmatched-messages?${qs}`
                : "/admin/unmatched-messages",
              { scroll: false },
            );
          });
        }}
      >
        <label className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          Find a lead
          <input
            type="search"
            name="q"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, phone, or email"
            className="desk-focus mt-1 h-8 w-full rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2 text-sm font-normal text-[var(--desk-ink)] normal-case"
          />
        </label>
        <p className="mt-2 text-[0.75rem] text-[var(--desk-ink-muted)]">
          WhatsApp rows suggest a match from the sender number. Messenger needs
          a search — then use Link to lead.
        </p>
      </form>

      {showLoading ? (
        <DeskTableSkeleton columns={4} rows={4} />
      ) : showEmpty ? (
        <DeskEmptyState
          title="No unmatched messages"
          body="Inbound WhatsApp and Messenger that we cannot attach to a lead wait here. Linking a row moves it onto that lead's thread."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <UnmatchedRow
              key={row.id}
              row={row}
              searchedLeads={searchedLeads}
              pending={pending}
              onLink={link}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function UnmatchedRow({
  row,
  searchedLeads,
  pending,
  onLink,
}: {
  row: UnmatchedMessageRow;
  searchedLeads: DeskLeadMatch[];
  pending: boolean;
  onLink: (messageId: string, leadId: string) => void;
}) {
  const options = mergeLeadOptions(row.suggestedLeads, searchedLeads);
  const channel = threadChannelLabels[row.channel];
  const sender = row.externalSenderId?.trim() || "Unknown sender";

  return (
    <li className="rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--desk-ink)]">
            {channel}
            <span className="font-medium text-[var(--desk-ink-muted)]">
              {" "}
              · {sender}
            </span>
          </p>
          <p className="mt-0.5 text-[0.75rem] text-[var(--desk-ink-muted)]">
            {row.direction === "inbound" ? "Received" : "Sent"} ·{" "}
            {formatLeadDate(row.createdAt)}
          </p>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 text-sm whitespace-pre-wrap text-[var(--desk-ink)]">
        {row.body || "—"}
      </p>
      {options.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--desk-ink-muted)]">
          {row.channel === "messenger"
            ? "No phone match for Messenger. Search by name or phone above, then link."
            : "No current lead shares this number. Search by name or phone above, then link."}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2 border-t border-[var(--desk-line)] pt-3">
          {options.map((match) => (
            <li
              key={match.id}
              className="flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <p className="min-w-0">
                <span className="font-medium text-[var(--desk-ink)]">
                  {match.name}
                </span>
                <span className="text-[var(--desk-ink-muted)]">
                  {" "}
                  · {match.phone} · {leadStatusLabels[match.status]} ·{" "}
                  {leadDestinationLabels[match.destinationInterest]}
                </span>
              </p>
              <span className="flex items-center gap-2">
                <Link
                  href={`/admin/leads?lead=${match.id}`}
                  className="desk-focus text-xs font-semibold text-[var(--desk-accent)]"
                >
                  Open lead
                </Link>
                <button
                  type="button"
                  disabled={pending}
                  className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] bg-[var(--desk-accent)] px-2.5 text-xs font-semibold text-white disabled:opacity-60"
                  onClick={() => onLink(row.id, match.id)}
                >
                  Link to lead
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
