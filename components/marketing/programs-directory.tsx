import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import {
  ProgramCompareBar,
  ProgramCompareIdsField,
  ProgramCompareProvider,
} from "@/components/marketing/program-compare";
import { ProgramCard } from "@/components/marketing/program-card";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { publicProgramsHref } from "@/lib/programs-href";
import {
  programCountryLabels,
  programLevelLabels,
} from "@/lib/programs-labels";
import {
  publicProgramCountries,
  publicProgramLevels,
  type PublicProgramFilters,
  type PublicProgramList,
} from "@/lib/programs-public";

type ProgramsDirectoryProps = {
  locale: Locale;
  dict: Dictionary;
  filters: PublicProgramFilters;
  list: PublicProgramList;
  selectedIds: string[];
};

export function ProgramsDirectory({
  locale,
  dict,
  filters,
  list,
  selectedIds,
}: ProgramsDirectoryProps) {
  const hasFilters = Boolean(filters.country || filters.level || filters.field);
  const formAction = localizedHref("/programs", locale);

  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <div className="eyebrow-pill inline-flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span>{dict.programs.eyebrow}</span>
        </div>
        <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.1] font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.05]">
          {dict.programs.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 font-normal text-slate-600">
          {dict.programs.body}
        </p>

        <ProgramCompareProvider
          locale={locale}
          filters={filters}
          initialIds={selectedIds}
          copy={dict.programs.compare}
        >
          <form
            method="get"
            action={formAction}
            className="mt-10 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_auto]"
          >
            <ProgramCompareIdsField />
            <label className="text-xs font-bold tracking-[0.06em] text-slate-500 uppercase">
              {dict.programs.countryLabel}
              <select
                name="country"
                defaultValue={filters.country}
                className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800 normal-case focus:border-orange-500"
              >
                <option value="">{dict.programs.allCountries}</option>
                {publicProgramCountries.map((country) => (
                  <option key={country} value={country}>
                    {programCountryLabels[country]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold tracking-[0.06em] text-slate-500 uppercase">
              {dict.programs.levelLabel}
              <select
                name="level"
                defaultValue={filters.level}
                className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800 normal-case focus:border-orange-500"
              >
                <option value="">{dict.programs.allLevels}</option>
                {publicProgramLevels.map((level) => (
                  <option key={level} value={level}>
                    {programLevelLabels[level]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold tracking-[0.06em] text-slate-500 uppercase">
              {dict.programs.fieldLabel}
              <input
                type="search"
                name="field"
                defaultValue={filters.field}
                placeholder={dict.programs.fieldPlaceholder}
                className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800 normal-case focus:border-orange-500"
              />
            </label>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="btn-sunset focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-5 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                {dict.programs.applyFilters}
              </button>
              {hasFilters ? (
                <Link
                  href={publicProgramsHref(locale, { ids: selectedIds })}
                  className="btn-secondary-glass focus-ring inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-bold text-slate-800 shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
                >
                  {dict.programs.clearFilters}
                </Link>
              ) : null}
            </div>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            {list.total} {dict.programs.resultCount}
          </p>

          {list.rows.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center text-slate-500">
              {dict.programs.empty}
            </p>
          ) : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {list.rows.map((program) => (
                <li key={program.id}>
                  <ProgramCard program={program} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          )}

          {list.pageCount > 1 ? (
            <nav
              className="mt-10 flex items-center justify-between gap-3"
              aria-label={dict.programs.pageLabel}
            >
              {list.page > 1 ? (
                <Link
                  href={publicProgramsHref(locale, {
                    ...filters,
                    page: list.page - 1,
                    ids: selectedIds,
                  })}
                  className="btn-secondary-glass focus-ring inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold text-slate-800 shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
                >
                  {dict.programs.previous}
                </Link>
              ) : (
                <span />
              )}
              <p className="text-sm text-slate-500">
                {dict.programs.pageLabel} {list.page} / {list.pageCount}
              </p>
              {list.page < list.pageCount ? (
                <Link
                  href={publicProgramsHref(locale, {
                    ...filters,
                    page: list.page + 1,
                    ids: selectedIds,
                  })}
                  className="btn-secondary-glass focus-ring inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold text-slate-800 shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
                >
                  {dict.programs.next}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}

          <ProgramCompareBar locale={locale} />
        </ProgramCompareProvider>
      </PageShell>
    </section>
  );
}
