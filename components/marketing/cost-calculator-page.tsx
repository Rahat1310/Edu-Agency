"use client";

import { useRouter } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { MarketingEmptyState } from "@/components/marketing/empty-state";
import { MarketingErrorState } from "@/components/marketing/error-state";
import {
  MarketingPreviewBar,
  useMarketingPreview,
  type MarketingPreviewState,
} from "@/components/marketing/preview";
import { CostCalculatorResultSkeleton } from "@/components/marketing/skeleton";
import type { YearlyCostEstimate } from "@/lib/costs/estimate";
import { formatMoney } from "@/lib/costs/format";
import type { CostCalculatorQuery } from "@/lib/costs/query";
import type { BdtRates } from "@/lib/fx/load-rates";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import {
  publicProgramCountries,
  publicProgramLevels,
  type CostCalculatorProgramOption,
} from "@/lib/programs-public";

type CostCalculatorPageProps = {
  locale: Locale;
  dict: Dictionary;
  query: CostCalculatorQuery;
  programs: CostCalculatorProgramOption[];
  estimate: YearlyCostEstimate | null;
  rates: BdtRates | null;
};

export function CostCalculatorPage({
  locale,
  dict,
  query,
  programs,
  estimate,
  rates,
}: CostCalculatorPageProps) {
  const copy = dict.costCalculator;
  const formAction = localizedHref("/cost-calculator", locale);
  const selectedProgram = programs.find((row) => row.id === query.programId);
  const { preview, setPreview } = useMarketingPreview();
  const router = useRouter();

  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <MarketingPreviewBar preview={preview} onChange={setPreview} />
        <div className="eyebrow-pill mt-6 inline-flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span>{copy.eyebrow}</span>
        </div>
        <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.1] font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.05]">
          {copy.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 font-normal text-slate-600">
          {copy.lede}
        </p>

        <form
          method="get"
          action={formAction}
          className="mt-10 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_auto]"
        >
          <label className="text-xs font-bold tracking-[0.06em] text-slate-500 uppercase">
            {copy.destinationLabel}
            <select
              name="destination"
              required
              defaultValue={query.destination}
              className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800 normal-case focus:border-orange-500"
            >
              <option value="">{copy.destinationPlaceholder}</option>
              {publicProgramCountries.map((country) => (
                <option key={country} value={country}>
                  {copy.destinations[country]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold tracking-[0.06em] text-slate-500 uppercase">
            {copy.levelLabel}
            <select
              name="level"
              defaultValue={query.level}
              className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800 normal-case focus:border-orange-500"
            >
              <option value="">{copy.allLevels}</option>
              {publicProgramLevels.map((level) => (
                <option key={level} value={level}>
                  {copy.levels[level]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold tracking-[0.06em] text-slate-500 uppercase">
            {copy.programLabel}
            <select
              name="program"
              defaultValue={selectedProgram?.id ?? ""}
              disabled={!query.destination || programs.length === 0}
              className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800 normal-case focus:border-orange-500 disabled:bg-slate-100"
            >
              <option value="">{copy.programPlaceholder}</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.universityName} — {program.field} (
                  {program.tuitionAmount} {program.tuitionCurrency})
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn-sunset focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              {copy.submit}
            </button>
          </div>
        </form>

        {query.destination && programs.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {copy.noPrograms}
          </p>
        ) : null}

        <CostCalculatorOutcome
          locale={locale}
          copy={copy}
          retryLabel={dict.common.tryAgain}
          query={query}
          estimate={estimate}
          rates={rates}
          preview={preview}
          onRetry={() => {
            setPreview("off");
            router.refresh();
          }}
        />
      </PageShell>
    </section>
  );
}

function CostCalculatorOutcome({
  locale,
  copy,
  retryLabel,
  query,
  estimate,
  rates,
  preview,
  onRetry,
}: {
  locale: Locale;
  copy: Dictionary["costCalculator"];
  retryLabel: string;
  query: CostCalculatorQuery;
  estimate: YearlyCostEstimate | null;
  rates: BdtRates | null;
  preview: MarketingPreviewState;
  onRetry: () => void;
}) {
  if (preview === "loading") {
    return <CostCalculatorResultSkeleton label={copy.loadingAria} />;
  }

  if (preview === "error") {
    return (
      <MarketingErrorState
        className="mt-10"
        title={copy.errorTitle}
        body={copy.errorBody}
        retryLabel={retryLabel}
        onRetry={onRetry}
      />
    );
  }

  if (!query.destination) {
    return (
      <MarketingEmptyState
        className="mt-10"
        title={copy.promptTitle}
        body={copy.prompt}
      />
    );
  }

  if (preview === "empty" || !estimate) {
    return (
      <MarketingEmptyState
        className="mt-10"
        title={copy.emptyBandsTitle}
        body={copy.emptyBands}
      />
    );
  }

  if (estimate && !rates) {
    return (
      <MarketingErrorState
        className="mt-10"
        title={copy.errorTitle}
        body={copy.ratesError}
        retryLabel={retryLabel}
        onRetry={onRetry}
      />
    );
  }

  if (estimate && rates) {
    return (
      <EstimateResult
        locale={locale}
        copy={copy}
        estimate={estimate}
        rates={rates}
      />
    );
  }

  return null;
}

function EstimateResult({
  locale,
  copy,
  estimate,
  rates,
}: {
  locale: Locale;
  copy: Dictionary["costCalculator"];
  estimate: YearlyCostEstimate;
  rates: BdtRates;
}) {
  const rateDate = new Intl.DateTimeFormat(
    locale === "bn" ? "bn-BD" : "en-GB",
    { dateStyle: "medium" },
  ).format(new Date(rates.fetchedAt));

  const headlineLocal =
    estimate.headlineLocal != null && estimate.headlineLocalCurrency
      ? formatMoney(
          estimate.headlineLocal,
          estimate.headlineLocalCurrency,
          locale,
        )
      : null;

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <p className="font-utility text-[0.68rem] font-bold tracking-[0.12em] text-orange-300 uppercase">
          {copy.headlineLabel}
        </p>
        {headlineLocal ? (
          <p className="font-heading mt-4 text-3xl font-black tracking-tight text-white tabular-nums sm:text-4xl">
            {headlineLocal}
          </p>
        ) : null}
        <p className="font-heading mt-2 text-2xl font-bold tracking-tight text-amber-400 tabular-nums">
          {formatMoney(estimate.headlineBdt, "BDT", locale)}
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          {copy.destinations[estimate.destination]}
          {estimate.programLabel ? ` · ${estimate.programLabel}` : null}
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 shadow-2xs sm:p-6">
        <h2 className="font-heading text-xl font-bold tracking-tight text-slate-900">
          {copy.breakdownLabel}
        </h2>
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">{copy.breakdownLabel}</caption>
          <thead>
            <tr className="font-utility text-left text-[0.68rem] tracking-[0.08em] text-slate-500 uppercase">
              <th className="pb-2 font-semibold">{copy.yearlyLabel}</th>
              <th className="pb-2 text-right font-semibold">
                {copy.localLabel}
              </th>
              <th className="pb-2 text-right font-semibold">{copy.bdtLabel}</th>
            </tr>
          </thead>
          <tbody>
            {estimate.tuition ? (
              <BreakdownRow
                locale={locale}
                label={copy.categories.tuition}
                note={
                  estimate.tuitionSource === "program"
                    ? copy.tuitionProgram
                    : copy.tuitionGeneric
                }
                line={estimate.tuition}
              />
            ) : null}
            {estimate.living.map((line) => (
              <BreakdownRow
                key={line.category}
                locale={locale}
                label={copy.categories[line.category]}
                note={
                  line.monthlyLocal != null
                    ? `${copy.monthlyLabel}: ${formatMoney(line.monthlyLocal, line.currency, locale)}`
                    : undefined
                }
                line={line}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--border)]">
              <th className="pt-3 text-left font-bold text-[var(--brand-navy)]">
                {copy.livingSubtotal}
              </th>
              <td className="pt-3 text-right font-bold text-[var(--brand-navy)] tabular-nums">
                {estimate.livingYearlyLocal != null &&
                estimate.living[0]?.currency
                  ? formatMoney(
                      estimate.livingYearlyLocal,
                      estimate.living[0].currency,
                      locale,
                    )
                  : "—"}
              </td>
              <td className="pt-3 text-right font-bold text-[var(--brand-navy)] tabular-nums">
                {formatMoney(estimate.livingYearlyBdt, "BDT", locale)}
              </td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
          {rates.source === "live" ? copy.rateLive : copy.rateFallback}{" "}
          {copy.rateAsOf} {rateDate}.
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {copy.disclaimer}
        </p>
      </div>
    </div>
  );
}

function BreakdownRow({
  locale,
  label,
  note,
  line,
}: {
  locale: Locale;
  label: string;
  note?: string;
  line: NonNullable<YearlyCostEstimate["tuition"]>;
}) {
  return (
    <tr className="border-t border-[var(--border)]/80">
      <th className="py-3 text-left font-semibold text-[var(--brand-ink)]">
        {label}
        {note ? (
          <span className="mt-0.5 block font-normal text-[var(--muted-foreground)]">
            {note}
          </span>
        ) : null}
      </th>
      <td className="py-3 text-right text-[var(--brand-ink)] tabular-nums">
        {formatMoney(line.yearlyLocal, line.currency, locale)}
      </td>
      <td className="py-3 text-right text-[var(--brand-ink)] tabular-nums">
        {formatMoney(line.yearlyBdt, "BDT", locale)}
      </td>
    </tr>
  );
}
