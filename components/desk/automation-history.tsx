"use client";

import { DeskEmptyState } from "@/components/desk/empty-state";
import { DeskErrorState } from "@/components/desk/error-state";
import { DeskPreviewBar, useDeskPreview } from "@/components/desk/preview";
import { DeskAutomationHistorySkeleton } from "@/components/desk/skeleton";
import { formatLeadDate } from "@/lib/leads/labels";
import type { DeskAutomationEvent } from "@/lib/messages/types";

type AutomationHistoryProps = {
  events: DeskAutomationEvent[];
};

export function AutomationHistory({ events }: AutomationHistoryProps) {
  const { preview, setPreview } = useDeskPreview();
  const showLoading = preview === "loading";
  const showEmpty =
    preview === "empty" || (preview === "off" && events.length === 0);
  const showError = preview === "error";

  return (
    <section
      aria-labelledby="lead-automation-heading"
      aria-busy={showLoading || undefined}
    >
      <h3
        id="lead-automation-heading"
        className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase"
      >
        Reminders & nurture
      </h3>
      <div className="mt-2">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
      </div>
      <div className="mt-2">
        {showLoading ? (
          <DeskAutomationHistorySkeleton />
        ) : showError ? (
          <DeskErrorState
            title="Reminder history could not load"
            body="The rest of this file is still here. Try again."
            onRetry={() => setPreview("off")}
          />
        ) : showEmpty ? (
          <DeskEmptyState
            title="No reminders or nurture yet"
            body="Intake deadline reminders and idle-lead follow-ups will list here after the scheduled jobs send them."
          />
        ) : (
          <ol
            className="space-y-2"
            aria-label="Reminders and nurture, oldest first"
          >
            {events.map((event) => (
              <li key={`${event.kind}-${event.id}`}>
                <article className="rounded-[var(--desk-radius)] border border-dashed border-[var(--desk-line)] px-2.5 py-2">
                  <p className="text-[0.65rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
                    {event.kind === "nurture" ? "Nurture" : "Reminder"}
                  </p>
                  <p className="mt-1 text-sm">{event.label}</p>
                  <p className="mt-1 text-[0.7rem] text-[var(--desk-ink-muted)]">
                    {formatLeadDate(event.sentAt)}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
