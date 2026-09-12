"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageShell } from "@/components/layout/page-shell";
import { MarketingEmptyState } from "@/components/marketing/empty-state";
import { MarketingErrorState } from "@/components/marketing/error-state";
import {
  MarketingPreviewBar,
  useMarketingPreview,
} from "@/components/marketing/preview";
import { ProgramCompareTableSkeleton } from "@/components/marketing/skeleton";
import { parseAmount } from "@/lib/costs/estimate";
import { formatMoney } from "@/lib/costs/format";
import { tuitionCurrencies, type TuitionCurrency } from "@/db/schema";
import { toBdt, type BdtRates } from "@/lib/fx/load-rates";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { publicProgramsHref } from "@/lib/programs-href";
import { compareProgramsHref } from "@/lib/programs-compare";
import {
  programCountryLabels,
  programLevelLabels,
} from "@/lib/programs-labels";
import type { PublicProgramDetail } from "@/lib/programs-public";

function isTuitionCurrency(value: string): value is TuitionCurrency {
  return (tuitionCurrencies as readonly string[]).includes(value);
}

type ProgramCompareTableProps = {
  locale: Locale;
  dict: Dictionary;
  programs: PublicProgramDetail[];
  requestedCount: number;
  rates: BdtRates | null;
};

export function ProgramCompareTable({
  locale,
  dict,
  programs,
  requestedCount,
  rates,
}: ProgramCompareTableProps) {
  const copy = dict.programs.compare;
  const { preview, setPreview } = useMarketingPreview();
  const router = useRouter();
  const visiblePrograms = preview === "empty" ? [] : programs;

  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <MarketingPreviewBar preview={preview} onChange={setPreview} />
        <Link
          href={
            programs.length > 0
              ? publicProgramsHref(locale, {
                  ids: programs.map((program) => program.id),
                })
              : localizedHref("/programs", locale)
          }
          className="focus-ring mt-4 inline-flex min-h-11 items-center rounded-md text-sm font-bold text-[var(--brand-blue)]"
        >
          {copy.back}
        </Link>
        <p className="font-utility mt-6 text-[0.68rem] font-semibold tracking-[0.16em] text-[var(--brand-green)] uppercase">
          {dict.programs.eyebrow}
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl font-bold tracking-[-0.045em] text-[var(--brand-navy)] sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--brand-ink)]/80">
          {copy.lede}
        </p>

        {preview === "loading" ? (
          <ProgramCompareTableSkeleton label={copy.loadingAria} />
        ) : preview === "error" ? (
          <MarketingErrorState
            className="mt-10"
            title={copy.errorTitle}
            body={copy.errorBody}
            retryLabel={dict.common.tryAgain}
            onRetry={() => {
              setPreview("off");
              router.refresh();
            }}
          />
        ) : visiblePrograms.length === 0 ? (
          <MarketingEmptyState
            className="mt-10"
            title={copy.emptyTitle}
            body={requestedCount > 0 ? copy.missing : copy.empty}
            action={
              <Link
                href={localizedHref("/programs", locale)}
                className="focus-ring inline-flex min-h-11 items-center rounded-full bg-[var(--brand-navy)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-blue)]"
              >
                {copy.back}
              </Link>
            }
          />
        ) : (
          <CompareTable
            locale={locale}
            dict={dict}
            copy={copy}
            programs={visiblePrograms}
            requestedCount={requestedCount}
            rates={rates}
            retryLabel={dict.common.tryAgain}
            onRatesRetry={() => {
              setPreview("off");
              router.refresh();
            }}
          />
        )}
      </PageShell>
    </section>
  );
}

function CompareTable({
  locale,
  dict,
  copy,
  programs,
  requestedCount,
  rates,
  retryLabel,
  onRatesRetry,
}: {
  locale: Locale;
  dict: Dictionary;
  copy: Dictionary["programs"]["compare"];
  programs: PublicProgramDetail[];
  requestedCount: number;
  rates: BdtRates | null;
  retryLabel: string;
  onRatesRetry: () => void;
}) {
  const rows: {
    key: string;
    label: string;
    values: ReactNode[];
  }[] = [
    {
      key: "university",
      label: copy.university,
      values: programs.map((program) => program.universityName),
    },
    {
      key: "country",
      label: dict.programs.countryLabel,
      values: programs.map((program) => programCountryLabels[program.country]),
    },
    {
      key: "level",
      label: dict.programs.levelLabel,
      values: programs.map((program) => programLevelLabels[program.level]),
    },
    {
      key: "field",
      label: dict.programs.fieldLabel,
      values: programs.map((program) => program.field),
    },
    {
      key: "tuition",
      label: dict.programs.tuitionLabel,
      values: programs.map((program) => (
        <TuitionCell
          key={program.id}
          locale={locale}
          copy={copy}
          amount={program.tuitionAmount}
          currency={program.tuitionCurrency}
          rates={rates}
        />
      )),
    },
    {
      key: "intake",
      label: dict.programs.intakeLabel,
      values: programs.map((program) => {
        const intake = program.intakeMonths?.filter(Boolean) ?? [];
        return intake.length > 0 ? intake.join(", ") : copy.emptyCell;
      }),
    },
    {
      key: "requirements",
      label: dict.programs.requirementsLabel,
      values: programs.map(
        (program) => program.requirements?.trim() || copy.emptyCell,
      ),
    },
    {
      key: "scholarship",
      label: dict.programs.scholarshipLabel,
      values: programs.map(
        (program) => program.scholarshipInfo?.trim() || copy.emptyCell,
      ),
    },
  ];

  return (
    <>
      {requestedCount > programs.length ? (
        <p
          role="status"
          className="mt-6 rounded-xl border border-[var(--brand-amber)]/40 bg-[#fff6e4] px-4 py-3 text-sm text-[var(--brand-navy)]"
        >
          {copy.missing}
        </p>
      ) : null}
      {!rates ? (
        <MarketingErrorState
          className="mt-6"
          title={copy.ratesErrorTitle}
          body={copy.ratesError}
          retryLabel={retryLabel}
          onRetry={onRatesRetry}
        />
      ) : null}

      <div
        tabIndex={0}
        role="region"
        aria-label={copy.tableRegion}
        className="focus-ring mt-10 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white"
      >
        <table className="w-full min-w-[40rem] text-sm">
          <caption className="sr-only">{copy.title}</caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--brand-sky)]">
              <th
                scope="col"
                className="font-utility w-40 px-4 py-3 text-left text-[0.68rem] tracking-[0.08em] text-[var(--muted-foreground)] uppercase"
              >
                {copy.attribute}
              </th>
              {programs.map((program) => {
                const remaining = programs
                  .filter((item) => item.id !== program.id)
                  .map((item) => item.id);
                return (
                  <th
                    key={program.id}
                    scope="col"
                    className="min-w-52 px-4 py-3 text-left align-top"
                  >
                    <Link
                      href={localizedHref(`/programs/${program.id}`, locale)}
                      className="focus-ring font-display text-base font-bold tracking-[-0.03em] text-[var(--brand-navy)] hover:text-[var(--brand-blue)]"
                    >
                      {program.universityName}
                    </Link>
                    <Link
                      href={
                        remaining.length > 0
                          ? compareProgramsHref(locale, remaining)
                          : localizedHref("/programs", locale)
                      }
                      className="focus-ring mt-2 inline-flex min-h-11 items-center text-xs font-bold text-[var(--brand-blue)]"
                    >
                      {copy.remove}
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-[var(--border)]">
                <th
                  scope="row"
                  className="px-4 py-3 text-left align-top font-bold text-[var(--brand-navy)]"
                >
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.key}-${programs[index]?.id ?? index}`}
                    className="px-4 py-3 align-top leading-6 whitespace-pre-wrap text-[var(--brand-ink)]"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        {copy.rateNote}
      </p>
    </>
  );
}

function TuitionCell({
  locale,
  copy,
  amount,
  currency,
  rates,
}: {
  locale: Locale;
  copy: Dictionary["programs"]["compare"];
  amount: string;
  currency: string;
  rates: BdtRates | null;
}) {
  const parsed = parseAmount(amount);
  const local = isTuitionCurrency(currency)
    ? formatMoney(parsed, currency, locale)
    : `${amount} ${currency}`;

  if (!rates || !isTuitionCurrency(currency)) {
    return (
      <span className="font-semibold text-[var(--brand-navy)] tabular-nums">
        {local}
      </span>
    );
  }

  const bdt = toBdt(parsed, currency, rates);
  return (
    <>
      <span className="font-semibold text-[var(--brand-navy)] tabular-nums">
        {local}
      </span>
      <span className="mt-1 block text-[var(--muted-foreground)]">
        {copy.tuitionBdt.replace("{amount}", formatMoney(bdt, "BDT", locale))}
      </span>
    </>
  );
}
