"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  LoaderCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { ProgramCompareIdsField } from "@/components/marketing/program-compare";
import {
  changeProgramCountry,
  programCountryText,
  programIntakeText,
  programLevelText,
} from "@/lib/programs-directory";
import type { ProgramCountry, ProgramLevel } from "@/db/schema";
import type { Locale } from "@/lib/i18n/config";
import type { PublicProgramFilters } from "@/lib/programs-public";
import { localizedHref } from "@/lib/i18n/paths";
import styles from "./programs-directory.module.css";

export function ProgramFilters({
  locale,
  filters,
  countries,
  levels,
  chinaLevels,
  intakes,
  universities,
}: {
  locale: Locale;
  filters: PublicProgramFilters;
  countries: readonly ProgramCountry[];
  levels: readonly ProgramLevel[];
  chinaLevels: readonly ProgramLevel[];
  intakes: readonly string[];
  universities: { id: string; name: string }[];
}) {
  const bn = locale === "bn";
  const [draft, setDraft] = useState(filters);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const restore = () => setPending(false);
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);
  const china = draft.country === "china";
  const visibleLevels = china
    ? chinaLevels
    : levels.filter(
        (level) =>
          !draft.country ||
          !["foundation", "foundation_bachelor"].includes(level),
      );
  const advancedCount =
    Number(Boolean(draft.university)) +
    Number(Boolean(draft.language)) +
    Number(Boolean(draft.scholarship));
  const update = (values: Partial<PublicProgramFilters>) =>
    setDraft((old) => ({ ...old, ...values }));
  const selectedUniversity = universities.find(
    (university) =>
      university.id === draft.university ||
      university.name.toLowerCase() === draft.university?.toLowerCase(),
  );
  return (
    <form
      method="get"
      action={localizedHref("/programs", locale) + "#program-results"}
      className={styles.filters}
      aria-label={bn ? "কোর্স খোঁজার ফিল্টার" : "Find a course"}
      aria-busy={pending}
      onSubmit={() => setPending(true)}
    >
      <ProgramCompareIdsField />
      <label className={styles.search}>
        <span>{bn ? "কী পড়তে চান?" : "What would you like to study?"}</span>
        <div>
          <Search size={21} aria-hidden="true" />
          <input
            type="search"
            name="field"
            value={draft.field}
            onChange={(event) => update({ field: event.target.value })}
            maxLength={200}
            placeholder={
              bn
                ? "বিষয় বা বিশ্ববিদ্যালয়ের নাম লিখুন"
                : "Search a subject or university"
            }
          />
        </div>
      </label>
      <div className={china ? styles.mainFilters : styles.mainFiltersCompact}>
        <label>
          <span>{bn ? "দেশ" : "Country"}</span>
          <div className={styles.select}>
            <select
              name="country"
              value={draft.country}
              onChange={(event) =>
                setDraft(
                  changeProgramCountry(
                    draft,
                    event.target.value as PublicProgramFilters["country"],
                  ),
                )
              }
            >
              <option value="">{bn ? "সব দেশ" : "All countries"}</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {programCountryText(country, locale)}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </div>
        </label>
        <label>
          <span>{bn ? "কোর্সের ধরন" : "Study level"}</span>
          <div className={styles.select}>
            <select
              name="level"
              value={draft.level}
              onChange={(event) =>
                update({
                  level: event.target.value as PublicProgramFilters["level"],
                })
              }
            >
              <option value="">
                {bn ? "সব ধরনের কোর্স" : "All study levels"}
              </option>
              {visibleLevels.map((level) => (
                <option key={level} value={level}>
                  {programLevelText(level, locale)}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </div>
        </label>
        {china ? (
          <label>
            <span>{bn ? "ক্লাস শুরু" : "Start date"}</span>
            <div className={styles.select}>
              <select
                name="intake"
                value={draft.intake ?? ""}
                onChange={(event) => update({ intake: event.target.value })}
              >
                <option value="">{bn ? "সব তারিখ" : "Any start date"}</option>
                {intakes.map((intake) => (
                  <option key={intake} value={intake}>
                    {programIntakeText(intake, locale)}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </label>
        ) : null}
      </div>
      {china ? (
        <div className={styles.filterBottom}>
          <details
            className={styles.moreFilters}
            open={Boolean(
              filters.university || filters.language || filters.scholarship,
            )}
          >
            <summary>
              <SlidersHorizontal size={16} aria-hidden="true" />
              {bn ? "আরও ফিল্টার" : "More filters"}
              {advancedCount ? (
                <span className={styles.filterCount}>{advancedCount}</span>
              ) : null}
              <ChevronDown size={15} aria-hidden="true" />
            </summary>
            <div className={styles.advancedGrid}>
              <label>
                <span>{bn ? "বিশ্ববিদ্যালয়" : "University"}</span>
                <div className={styles.select}>
                  <select
                    name="university"
                    value={selectedUniversity?.id ?? draft.university ?? ""}
                    onChange={(event) =>
                      update({ university: event.target.value })
                    }
                  >
                    <option value="">
                      {bn ? "সব বিশ্ববিদ্যালয়" : "All institutions"}
                    </option>
                    {draft.university && !selectedUniversity ? (
                      <option value={draft.university}>
                        {draft.university}
                      </option>
                    ) : null}
                    {universities.map((university) => (
                      <option key={university.id} value={university.id}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </label>
              <label>
                <span>{bn ? "পড়ার মাধ্যম" : "Teaching language"}</span>
                <div className={styles.select}>
                  <select
                    name="language"
                    value={draft.language ?? ""}
                    onChange={(event) =>
                      update({ language: event.target.value })
                    }
                  >
                    <option value="">
                      {bn ? "সব মাধ্যম" : "Any language"}
                    </option>
                    <option value="English">English</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </label>
              <label className={styles.scholarshipCheck}>
                <input
                  type="checkbox"
                  name="scholarship"
                  value="1"
                  checked={draft.scholarship ?? false}
                  onChange={(event) =>
                    update({ scholarship: event.target.checked })
                  }
                />
                <span>
                  {bn
                    ? "স্কলারশিপের সুযোগ আছে এমন অফার"
                    : "Offers with scholarship options"}
                </span>
              </label>
            </div>
            <p className={styles.applyHint}>
              {bn
                ? "পছন্দ বদলানোর পর ‘কোর্স দেখুন’ চাপুন।"
                : "Select your filters, then choose Show courses."}
            </p>
          </details>
        </div>
      ) : draft.university ? (
        <input type="hidden" name="university" value={draft.university} />
      ) : null}
      <div className={styles.formActions}>
        <p>
          {china
            ? bn
              ? "ক্লাস শুরুর তারিখ আর আবেদনের শেষ তারিখ আলাদা।"
              : "The start date and application deadline are different."
            : bn
              ? "দেশ ও কোর্সের ধরন বেছে নিয়ে শুরু করুন।"
              : "Start with a country and study level."}
        </p>
        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle
                size={18}
                className={styles.spinner}
                aria-hidden="true"
              />
              {bn ? "খোঁজা হচ্ছে…" : "Loading…"}
            </>
          ) : bn ? (
            "কোর্স দেখুন"
          ) : (
            "Show courses"
          )}
        </button>
      </div>
    </form>
  );
}
