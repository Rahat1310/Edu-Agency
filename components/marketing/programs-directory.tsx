import Link from "next/link";
import { chinaInstitutions, chinaIntakes, chinaOffers } from "@/lib/china-2027";
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
  const hasFilters = Boolean(
    filters.country ||
    filters.level ||
    filters.field ||
    filters.intake ||
    filters.university ||
    filters.language ||
    filters.scholarship,
  );
  const china = filters.country === "china";
  const bn = locale === "bn";
  const formAction = localizedHref("/programs", locale);
  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-blue)]">
          <span>{dict.programs.eyebrow}</span>
        </div>
        <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.15]">
          {china
            ? bn
              ? "চীনের বিশ্ববিদ্যালয় ও ২০২৭-এর অফার"
              : "China universities & 2027 offers"
            : dict.programs.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 font-normal text-slate-600">
          {china
            ? bn
              ? "ইনটেক, পড়ার মাধ্যম ও বিশ্ববিদ্যালয় অনুযায়ী বেছে নিন। প্রতিটি অফারে বিষয়, ফি, স্কলারশিপ ও যোগ্যতার শর্ত দেখুন।"
              : "Find your intake, teaching language and university. Open an offer to see its majors, fees, scholarship coverage and entry requirements."
            : dict.programs.body}
        </p>
        {!filters.country || china ? (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#0b2038] px-6 py-5 text-white">
            <div>
              <p className="font-semibold">
                {bn
                  ? "March ও September 2027 · China"
                  : "March & September 2027 · China"}
              </p>
              <p className="mt-1 text-sm text-slate-200">
                {chinaInstitutions.length}{" "}
                {bn ? "শিক্ষাপ্রতিষ্ঠান" : "institutions"} ·{" "}
                {chinaOffers.length}{" "}
                {bn
                  ? "অফার · যোগ্যতার শর্ত প্রযোজ্য"
                  : "offers · eligibility conditions apply"}
              </p>
            </div>
            <Link
              href={localizedHref(
                china ? "/destinations/china" : "/programs?country=china",
                locale,
              )}
              className="focus-ring inline-flex min-h-11 items-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {china
                ? bn
                  ? "কেন চীন?"
                  : "Why choose China?"
                : bn
                  ? "চীনের অফার দেখুন"
                  : "Explore China offers"}{" "}
              →
            </Link>
          </div>
        ) : null}

        <ProgramCompareProvider
          locale={locale}
          filters={filters}
          initialIds={selectedIds}
          copy={dict.programs.compare}
        >
          <form
            method="get"
            action={formAction}
            className="mt-8 grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs sm:grid-cols-2 lg:grid-cols-3"
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
              {bn
                ? "বিশ্ববিদ্যালয়, শহর বা বিষয় খুঁজুন"
                : "Search university, city or subject"}
              <input
                type="search"
                name="field"
                defaultValue={filters.field}
                placeholder={
                  bn
                    ? "যেমন: Computer Science, Xiamen"
                    : "e.g. Computer Science, Xiamen"
                }
                className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800 normal-case focus:border-orange-500"
              />
            </label>
            {china ? (
              <>
                <label className="text-xs font-bold text-slate-500">
                  {bn ? "ইনটেক" : "Intake"}
                  <select
                    name="intake"
                    defaultValue={filters.intake ?? ""}
                    className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800"
                  >
                    <option value="">
                      {bn ? "দুই ইনটেক" : "Both intakes"}
                    </option>
                    {chinaIntakes.map((intake) => (
                      <option key={intake} value={intake}>
                        {intake}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-500">
                  {bn
                    ? "বিশ্ববিদ্যালয় / শিক্ষাপ্রতিষ্ঠান"
                    : "University / institution"}
                  <select
                    name="university"
                    defaultValue={filters.university ?? ""}
                    className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800"
                  >
                    <option value="">
                      {bn ? "সব প্রতিষ্ঠান" : "All institutions"}
                    </option>
                    {chinaInstitutions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-500">
                  {bn ? "পড়ার মাধ্যম" : "Teaching language"}
                  <select
                    name="language"
                    defaultValue={filters.language ?? ""}
                    className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-normal text-slate-800"
                  >
                    <option value="">
                      {bn ? "সব মাধ্যম" : "All languages"}
                    </option>
                    <option value="English">English</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </label>
                <label className="flex min-h-11 items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="scholarship"
                    value="1"
                    defaultChecked={filters.scholarship ?? false}
                    className="focus-ring size-4 accent-orange-600"
                  />
                  {bn
                    ? "স্কলারশিপের সুযোগসহ অফার"
                    : "Offers with scholarship opportunities"}
                </label>
              </>
            ) : null}
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
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
            <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center text-slate-500">
              <p>{dict.programs.empty}</p>
              <Link
                href={localizedHref(
                  china ? "/programs?country=china" : "/programs",
                  locale,
                )}
                className="focus-ring mt-4 inline-flex min-h-11 items-center font-semibold text-orange-700"
              >
                {bn
                  ? "ফিল্টার সরিয়ে আবার দেখুন"
                  : "Reset filters and explore offers"}{" "}
                →
              </Link>
            </div>
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
