"use client";
import { DeskEmptyState } from "@/components/desk/empty-state";
import { formatLeadDate } from "@/lib/leads/labels";
import type { DeskAutomationEvent } from "@/lib/messages/types";
type AutomationHistoryProps = {
  events: DeskAutomationEvent[];
};
export function AutomationHistory({ events }: AutomationHistoryProps) {
  const showEmpty = events.length === 0;
  return (
    <section aria-labelledby="lead-automation-heading" aria-busy={undefined}>
      <h3
        id="lead-automation-heading"
        className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase"
      >
        Reminders & nurture
      </h3>
      <div className="mt-2"></div>
      <div className="mt-2">
        {showEmpty ? (
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
