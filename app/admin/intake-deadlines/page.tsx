import Link from "next/link";

import { asc } from "drizzle-orm";

import { IntakeDeadlineRowActions } from "@/components/admin/intake-deadline-row-actions";
import { db } from "@/db";
import { intakeDeadlines } from "@/db/schema";
import { calendarDateInTimeZone, isUpcomingYmd } from "@/lib/intakes/countdown";
import { programCountryLabels } from "@/lib/programs-labels";

export default async function AdminIntakeDeadlinesPage() {
  const rows = await db
    .select()
    .from(intakeDeadlines)
    .orderBy(
      asc(intakeDeadlines.destination),
      asc(intakeDeadlines.applicationDeadline),
    );
  const todayYmd = calendarDateInTimeZone(new Date());

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
            Intake deadlines
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
            Placeholder dates until destination research. Past rows stay here
            for history, but the public countdown only shows the nearest
            upcoming date for each destination.
          </p>
        </div>
        <Link
          href="/admin/intake-deadlines/new"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-blue)]"
        >
          New deadline
        </Link>
      </div>

      <p className="mt-8 text-sm text-[var(--muted-foreground)]">
        {rows.length} deadline{rows.length === 1 ? "" : "s"}
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--brand-sky)] text-xs tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">Destination</th>
              <th className="px-4 py-3 font-semibold">Intake</th>
              <th className="px-4 py-3 font-semibold">Deadline</th>
              <th className="px-4 py-3 font-semibold">Public</th>
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-[var(--muted-foreground)]"
                >
                  No intake deadlines yet. Add placeholder dates so destination
                  pages can show a countdown.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const upcoming = isUpcomingYmd(
                  todayYmd,
                  row.applicationDeadline,
                );

                return (
                  <tr key={row.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">
                      {programCountryLabels[row.destination]}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--brand-navy)]">
                      <Link
                        href={`/admin/intake-deadlines/${row.id}/edit`}
                        className="focus-ring rounded-md hover:text-[var(--brand-blue)]"
                      >
                        {row.intakeLabel}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.applicationDeadline}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          upcoming
                            ? "rounded-full bg-[var(--brand-green)]/12 px-2.5 py-1 text-xs font-bold text-[var(--brand-green)]"
                            : "rounded-full bg-[var(--brand-amber)]/16 px-2.5 py-1 text-xs font-bold text-[var(--brand-navy)]"
                        }
                      >
                        {upcoming ? "Upcoming" : "Past"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <IntakeDeadlineRowActions
                        id={row.id}
                        intakeLabel={row.intakeLabel}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
