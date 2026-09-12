"use client";

import { DeskEmptyState } from "@/components/desk/empty-state";
import {
  DeskPreviewBar,
  DeskPreviewError,
  useDeskPreview,
} from "@/components/desk/preview";
import { DeskTableSkeleton } from "@/components/desk/skeleton";
import { aiProviderUsageLabels } from "@/lib/ai/usage-caps";
import type { ProviderUsageSummary, UsageDayTotal } from "@/lib/ai/usage-view";
import { cn } from "@/lib/utils";

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function capLine(row: ProviderUsageSummary): string {
  const daily = `${formatCount(row.cap.requests)} req/day`;
  if (row.cap.tokensPerMinute) {
    return `${daily} · ${formatCount(row.cap.tokensPerMinute)} TPM`;
  }
  if (row.cap.altRequests) {
    return `${daily} without credits · ${formatCount(row.cap.altRequests)} ${row.cap.altRequestsLabel}`;
  }
  return `~${daily}`;
}

export function AiUsageDashboard({
  todayYmd,
  providers,
  daily,
}: {
  todayYmd: string;
  providers: ProviderUsageSummary[];
  daily: UsageDayTotal[];
}) {
  const { preview, setPreview } = useDeskPreview();
  const warned = providers.filter((row) => row.warned);
  const weekEmpty = preview === "empty" || daily.length === 0;

  if (preview === "loading") {
    return (
      <div>
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <h1 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
          AI usage
        </h1>
        <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
          Loading usage…
        </p>
        <div className="mt-4">
          <DeskTableSkeleton columns={6} rows={3} />
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
        AI usage
      </h1>
      <p className="mt-1 max-w-3xl text-[0.75rem] leading-5 text-[var(--desk-ink-muted)]">
        Today is {todayYmd} (Asia/Dhaka). Reference caps were accurate as of
        mid-2026 — re-check Groq, Gemini, and OpenRouter published free-tier
        limits now and then, because those terms shift without much notice.
      </p>

      {warned.length > 0 ? (
        <div
          role="status"
          className="mt-4 rounded-[var(--desk-radius)] border border-[var(--desk-warn)]/50 bg-[var(--desk-warn)]/10 px-3 py-3 text-sm text-[var(--desk-ink)]"
        >
          <p className="font-semibold text-[var(--desk-warn)]">
            Crossing 80% of today&apos;s reference cap
          </p>
          <ul className="mt-1 list-disc pl-5">
            {warned.map((row) => (
              <li key={row.provider}>
                {row.label}: {formatCount(row.todayCalls)} of{" "}
                {formatCount(row.cap.requests)} requests (
                {Math.round(row.percentOfCap)}%)
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="mt-4">
        <h2 className="text-sm font-semibold text-[var(--desk-ink)]">
          Today vs free-tier reference
        </h2>
        <div className="mt-2 overflow-x-auto rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)]">
          <table className="w-full min-w-[48rem] border-collapse text-left text-[0.8125rem]">
            <caption className="sr-only">
              Today&apos;s AI calls and tokens per provider against free-tier
              caps
            </caption>
            <thead className="bg-[var(--desk-surface-muted)] text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Provider
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Today
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Tokens in / out
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Last 7 days
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Reference cap
                </th>
                <th
                  scope="col"
                  className="min-w-[10rem] px-3 py-2 font-semibold"
                >
                  Today vs cap
                </th>
              </tr>
            </thead>
            <tbody>
              {providers.map((row) => (
                <tr
                  key={row.provider}
                  className={cn(
                    "border-t border-[var(--desk-line)]",
                    row.warned && "bg-[var(--desk-warn)]/10",
                  )}
                >
                  <th
                    scope="row"
                    className="px-3 py-3 font-semibold text-[var(--desk-ink)]"
                  >
                    {row.label}
                    {row.warned ? (
                      <span className="mt-0.5 block text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-warn)] uppercase">
                        80% cap
                      </span>
                    ) : null}
                  </th>
                  <td className="px-3 py-3 tabular-nums">
                    {formatCount(row.todayCalls)} calls
                    <span className="mt-0.5 block text-[0.75rem] text-[var(--desk-ink-muted)]">
                      {formatCount(row.todaySuccesses)} ok ·{" "}
                      {formatCount(row.todayFailures)} failed
                    </span>
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {formatCount(row.todayTokensIn)} /{" "}
                    {formatCount(row.todayTokensOut)}
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {formatCount(row.weekCalls)} calls
                    <span className="mt-0.5 block text-[0.75rem] text-[var(--desk-ink-muted)]">
                      {formatCount(row.weekTokensIn)} /{" "}
                      {formatCount(row.weekTokensOut)} tokens
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[0.75rem] leading-5 text-[var(--desk-ink-muted)]">
                    {capLine(row)}
                  </td>
                  <td className="px-3 py-3">
                    <UsageBar
                      percent={row.percentOfCap}
                      warned={row.warned}
                      label={`${row.label} ${Math.round(row.percentOfCap)} percent of daily cap`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 max-w-3xl text-[0.75rem] leading-5 text-[var(--desk-ink-muted)]">
          Groq&apos;s 6,000 TPM is a per-minute ceiling, not a daily total —
          this page flags the daily request cap. OpenRouter&apos;s 80% warning
          uses the 50/day no-credit line; with credits the published cap is
          1,000/day.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--desk-ink)]">
          Last 7 days
        </h2>
        {weekEmpty ? (
          <div className="mt-2">
            <DeskEmptyState
              title="No calls logged this week"
              body="Chat, matching, and other model calls will show here once a provider is used. Zero today is expected on a quiet day."
            />
          </div>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)]">
            <table className="w-full min-w-[40rem] border-collapse text-left text-[0.8125rem]">
              <caption className="sr-only">
                Call counts and token totals per provider for the last seven
                days
              </caption>
              <thead className="bg-[var(--desk-surface-muted)] text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Day
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Provider
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Calls
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Ok / failed
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Tokens in / out
                  </th>
                </tr>
              </thead>
              <tbody>
                {daily.map((row) => (
                  <tr
                    key={`${row.day}-${row.provider}`}
                    className="border-t border-[var(--desk-line)]"
                  >
                    <td className="px-3 py-2 tabular-nums">{row.day}</td>
                    <td className="px-3 py-2">
                      {aiProviderUsageLabels[row.provider]}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatCount(row.calls)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatCount(row.successes)} /{" "}
                      {formatCount(row.failures)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatCount(row.tokensIn)} / {formatCount(row.tokensOut)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function UsageBar({
  percent,
  warned,
  label,
}: {
  percent: number;
  warned: boolean;
  label: string;
}) {
  const width = Math.min(100, percent);

  return (
    <div>
      <div
        className="h-2 rounded-full bg-[var(--desk-surface-muted)]"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(width)}
      >
        <div
          className={cn(
            "h-2 rounded-full",
            warned ? "bg-[var(--desk-warn)]" : "bg-[var(--desk-ok)]",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <p
        className={cn(
          "mt-1 text-[0.75rem] font-semibold tabular-nums",
          warned ? "text-[var(--desk-warn)]" : "text-[var(--desk-ink-muted)]",
        )}
      >
        {Math.round(percent)}%
      </p>
    </div>
  );
}
