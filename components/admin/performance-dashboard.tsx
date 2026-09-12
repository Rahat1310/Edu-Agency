"use client";

import Link from "next/link";

import { DeskEmptyState } from "@/components/desk/empty-state";
import {
  DeskPreviewBar,
  DeskPreviewError,
  useDeskPreview,
} from "@/components/desk/preview";
import { DeskTableSkeleton } from "@/components/desk/skeleton";
import { leadStatusLabels, leadStatusOptions } from "@/lib/leads/labels";
import {
  performanceHref,
  type PerformanceQuery,
} from "@/lib/performance/query";
import {
  performanceRangeLabels,
  performanceRangeValues,
} from "@/lib/performance/stats";
import type { PerformanceSnapshot } from "@/lib/performance/types";
import { cn } from "@/lib/utils";

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

export function PerformanceDashboard({
  snapshot,
}: {
  snapshot: PerformanceSnapshot;
}) {
  const { preview, setPreview } = useDeskPreview();
  const query: PerformanceQuery = {
    range: snapshot.range,
    counselor: snapshot.combined ? "all" : (snapshot.counselorId ?? "all"),
  };
  const empty =
    preview === "empty" ||
    (snapshot.assigned === 0 && snapshot.visa.decided === 0);

  if (preview === "loading") {
    return (
      <div>
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <h1 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
          Performance
        </h1>
        <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
          Loading stats…
        </p>
        <div className="mt-4">
          <DeskTableSkeleton columns={2} rows={7} />
        </div>
      </div>
    );
  }

  if (preview === "error") {
    return (
      <div>
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <div className="mt-3">
          <DeskPreviewError onRetry={() => setPreview("off")} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <DeskPreviewBar preview={preview} onChange={setPreview} />
      <h1 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
        Performance
      </h1>
      <p className="mt-1 max-w-3xl text-[0.75rem] leading-5 text-[var(--desk-ink-muted)]">
        Assigned files only, for {snapshot.counselorLabel},{" "}
        {snapshot.rangeLabel} (Asia/Dhaka). Unassigned leads are left out until
        someone takes the file.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <nav aria-label="Date range" className="flex flex-wrap gap-1">
          {performanceRangeValues.map((range) => (
            <Link
              key={range}
              href={performanceHref(query, { range })}
              aria-current={snapshot.range === range ? "page" : undefined}
              className={cn(
                "desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border px-2.5 text-xs font-semibold",
                snapshot.range === range
                  ? "border-[var(--desk-accent)] text-[var(--desk-accent)]"
                  : "border-[var(--desk-line)]",
              )}
            >
              {performanceRangeLabels[range]}
            </Link>
          ))}
        </nav>
        {snapshot.canSelectCounselor ? (
          <form method="get" className="flex flex-wrap items-end gap-2">
            {snapshot.range !== "this_month" ? (
              <input type="hidden" name="range" value={snapshot.range} />
            ) : null}
            <label className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
              Counselor
              <select
                name="counselor"
                defaultValue={query.counselor}
                className="desk-focus mt-1 block min-w-[12rem] rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2 py-1.5 text-sm font-normal text-[var(--desk-ink)] normal-case"
              >
                <option value="all">Everyone assigned</option>
                {snapshot.counselors.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-2.5 text-xs font-semibold"
            >
              View
            </button>
          </form>
        ) : null}
      </div>

      {empty ? (
        <div className="mt-6">
          <DeskEmptyState
            title="No assigned files in this range"
            body="Assign a counselor on the lead file. Once a file has an owner, it counts toward that person's conversion and visa stats."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Assigned leads"
            value={formatCount(snapshot.assigned)}
            detail="Files currently assigned in this range."
          />
          <StatCard
            label="Conversion"
            value={formatPercent(snapshot.conversionPercent)}
            detail={`${formatCount(snapshot.converted)} of ${formatCount(snapshot.assigned)} reached applied or further.`}
          />
          <StatCard
            label="Visa success"
            value={formatPercent(snapshot.visa.percent)}
            detail={
              snapshot.visa.decided === 0
                ? "No decided visa files in this range."
                : `${formatCount(snapshot.visa.approved)} of ${formatCount(snapshot.visa.decided)} decided visas approved.`
            }
          />
        </div>
      )}

      {empty ? null : (
        <section className="mt-6" aria-labelledby="performance-stages-heading">
          <h2
            id="performance-stages-heading"
            className="text-sm font-semibold text-[var(--desk-ink)]"
          >
            Leads by pipeline stage
          </h2>
          <div className="mt-3 overflow-x-auto rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)]">
            <table className="w-full min-w-[20rem] text-left text-sm">
              <thead className="border-b border-[var(--desk-line)] bg-[var(--desk-surface-muted)] text-xs tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
                <tr>
                  <th className="px-3 py-2 font-semibold">Stage</th>
                  <th className="px-3 py-2 font-semibold">Leads</th>
                </tr>
              </thead>
              <tbody>
                {leadStatusOptions.map((status) => (
                  <tr
                    key={status}
                    className="border-t border-[var(--desk-line)]"
                  >
                    <td className="px-3 py-2">{leadStatusLabels[status]}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatCount(snapshot.byStage[status])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-3 py-3">
      <h2 className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
        {label}
      </h2>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--desk-accent)]">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-[var(--desk-ink-muted)]">
        {detail}
      </p>
    </article>
  );
}
