"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { resolveUnlinked } from "@/app/admin/unlinked/actions";
import { DeskEmptyState } from "@/components/desk/empty-state";
import { useDeskToast } from "@/components/desk/toast";
import {
  formatLeadDate,
  leadDestinationLabels,
  leadStatusLabels,
} from "@/lib/leads/labels";
import type { UnlinkedQueueRow } from "@/lib/leads/unlinked";

type UnlinkedQueueProps = {
  rows: UnlinkedQueueRow[];
};

export function UnlinkedQueue({ rows }: UnlinkedQueueProps) {
  const router = useRouter();
  const { toast } = useDeskToast();
  const [pending, startTransition] = useTransition();

  function run(input: Parameters<typeof resolveUnlinked>[0], okTitle: string) {
    startTransition(async () => {
      const result = await resolveUnlinked(input);
      if (!result.ok) {
        toast({ title: result.message, tone: "warn" });
        return;
      }
      toast({ title: okTitle, tone: "ok" });
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <DeskEmptyState
        title="No unlinked accounts"
        body="When a student signs up with a phone number that matches more than one inquiry, they wait here until a counselor picks the right file."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li
          key={row.id}
          className="rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-4 py-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--desk-ink)]">
                {row.fullName?.trim() || row.email}
              </p>
              <p className="mt-0.5 text-[0.75rem] text-[var(--desk-ink-muted)]">
                {row.email} · {row.phone} · queued{" "}
                {formatLeadDate(row.createdAt)}
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] px-2.5 text-xs font-semibold disabled:opacity-60"
              onClick={() =>
                run(
                  { action: "create", unlinkedAccountId: row.id },
                  "New pipeline record linked",
                )
              }
            >
              Create new record
            </button>
          </div>
          {row.matches.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--desk-ink-muted)]">
              No current leads share this phone number. Create a new record or
              wait for the student to confirm a different number.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 border-t border-[var(--desk-line)] pt-3">
              {row.matches.map((match) => {
                const taken = Boolean(
                  match.linkedUserId && match.linkedUserId !== row.userId,
                );

                return (
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
                      {taken ? (
                        <span className="ml-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
                          (already linked)
                        </span>
                      ) : null}
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
                        disabled={pending || taken}
                        className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] bg-[var(--desk-accent)] px-2.5 text-xs font-semibold text-white disabled:opacity-60"
                        onClick={() =>
                          run(
                            {
                              action: "link",
                              unlinkedAccountId: row.id,
                              leadId: match.id,
                            },
                            "Account linked",
                          )
                        }
                      >
                        Link this lead
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
