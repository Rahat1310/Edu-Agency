import Link from "next/link";
import { GraduationCap, Info, MessageCircle, SearchX, X } from "lucide-react";
import { chinaInstitutions, chinaIntakes, chinaOffers } from "@/lib/china-2027";
import { PageShell } from "@/components/layout/page-shell";
import {
  ProgramCompareBar,
  ProgramCompareProvider,
} from "@/components/marketing/program-compare";
import { ProgramFilters } from "@/components/marketing/program-filters";
import { ProgramCard } from "@/components/marketing/program-card";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { publicProgramsHref } from "@/lib/programs-href";
import {
  programCountryText,
  programIntakeText,
  programLevelText,
  removeProgramFilter,
  type RemovableProgramFilter,
} from "@/lib/programs-directory";
import {
  publicProgramCountries,
  publicProgramLevels,
  PUBLIC_PROGRAM_PAGE_SIZE,
  type PublicProgramFilters,
  type PublicProgramList,
} from "@/lib/programs-public";
import styles from "./programs-directory.module.css";

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
  const bn = locale === "bn";
  const china = filters.country === "china";
  const href = (path: string) => localizedHref(path, locale);
  const number = (value: number) =>
    new Intl.NumberFormat(bn ? "bn-BD" : "en-GB").format(value);
  const chips: { key: RemovableProgramFilter; label: string }[] = [];
  if (filters.country)
    chips.push({
      key: "country",
      label: programCountryText(filters.country, locale),
    });
  if (filters.level)
    chips.push({
      key: "level",
      label: programLevelText(filters.level, locale),
    });
  if (filters.field)
    chips.push({
      key: "field",
      label: (bn ? "খোঁজা হচ্ছে: " : "Search: ") + filters.field,
    });
  if (filters.intake)
    chips.push({
      key: "intake",
      label: programIntakeText(filters.intake, locale),
    });
  if (filters.university)
    chips.push({
      key: "university",
      label:
        chinaInstitutions.find((u) => u.id === filters.university)?.name ??
        filters.university,
    });
  if (filters.language)
    chips.push({
      key: "language",
      label: (bn ? "মাধ্যম: " : "Taught in ") + filters.language,
    });
  if (filters.scholarship)
    chips.push({
      key: "scholarship",
      label: bn ? "স্কলারশিপের সুযোগ" : "Scholarship options",
    });
  const start = list.total ? (list.page - 1) * PUBLIC_PROGRAM_PAGE_SIZE + 1 : 0;
  const end = list.total ? start + list.rows.length - 1 : 0;
  const chinaLevels = publicProgramLevels.filter((level) =>
    chinaOffers.some((o) =>
      (o.categories ?? [o.level]).some((category) => category === level),
    ),
  );
  const clearHref = publicProgramsHref(locale, { ids: selectedIds });

  return (
    <section
      className={[
        styles.page,
        selectedIds.length ? styles.withComparison : "",
      ].join(" ")}
    >
      <PageShell>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              {bn ? "কোর্স ও ভর্তি" : "COURSES & ADMISSIONS"}
            </p>
            <h1>
              {china
                ? bn
                  ? "চীনে আপনার কোর্স খুঁজুন।"
                  : "Find your course in China."
                : bn
                  ? "পরের কোর্সটা খুঁজে নিন।"
                  : "Find your next course."}
            </h1>
            <p className={styles.intro}>
              {bn
                ? "বিষয়, ফি আর ক্লাস শুরুর তারিখ মিলিয়ে দেখুন। পছন্দ হলে কয়েকটি কোর্স পাশাপাশি তুলনা করুন।"
                : "Compare subjects, fees and start dates. Pick a few courses to look at side by side."}
            </p>
          </div>
          <aside className={styles.headerAside}>
            {china ? (
              <>
                <span>
                  {number(chinaOffers.length)} {bn ? "টি অফার" : "offers"} ·{" "}
                  {number(chinaInstitutions.length)}{" "}
                  {bn ? "টি প্রতিষ্ঠান" : "institutions"}
                </span>
                <Link href={href("/destinations/china")}>
                  {bn ? "চীনে পড়াশোনার গাইড" : "Read the China study guide"}
                </Link>
              </>
            ) : (
              <>
                <GraduationCap size={24} aria-hidden="true" />
                <span>
                  {bn ? "চীনে পড়াশোনার কথা ভাবছেন?" : "Considering China?"}
                </span>
                <Link href={href("/programs?country=china")}>
                  {bn ? "২০২৭-এর কোর্স দেখুন" : "See the 2027 options"}
                </Link>
              </>
            )}
          </aside>
        </header>
        <ProgramCompareProvider
          locale={locale}
          filters={filters}
          initialIds={selectedIds}
          copy={dict.programs.compare}
        >
          <ProgramFilters
            key={JSON.stringify(filters)}
            locale={locale}
            filters={filters}
            countries={publicProgramCountries}
            levels={publicProgramLevels}
            chinaLevels={chinaLevels}
            intakes={chinaIntakes}
            universities={chinaInstitutions}
          />
          <div id="program-results" className={styles.results}>
            {chips.length ? (
              <div className={styles.applied}>
                <span className={styles.appliedLabel}>
                  {bn ? "আপনার পছন্দ" : "Your filters"}
                </span>
                <div className={styles.chips}>
                  {chips.map(({ key, label }) => (
                    <Link
                      key={key}
                      href={
                        publicProgramsHref(locale, {
                          ...removeProgramFilter(filters, key),
                          ids: selectedIds,
                        }) + "#program-results"
                      }
                      className={styles.chip}
                      aria-label={
                        (bn ? "ফিল্টার সরান: " : "Remove filter: ") + label
                      }
                    >
                      {label}
                      <X size={14} aria-hidden="true" />
                    </Link>
                  ))}
                  <Link href={clearHref} className={styles.clearAll}>
                    {bn ? "সব ফিল্টার সরান" : "Clear all"}
                  </Link>
                </div>
              </div>
            ) : null}
            <div className={styles.resultsHeading}>
              <div>
                <h2>
                  {number(list.total)}{" "}
                  {bn
                    ? "টি কোর্সের অফার"
                    : list.total === 1
                      ? "course option"
                      : "course options"}
                </h2>
                <p>
                  {list.total
                    ? bn
                      ? number(list.total) +
                        "টির মধ্যে " +
                        number(start) +
                        "–" +
                        number(end) +
                        "টি দেখছেন"
                      : "Showing " +
                        number(start) +
                        "–" +
                        number(end) +
                        " of " +
                        number(list.total)
                    : bn
                      ? "অন্য পছন্দ দিয়ে আবার দেখুন।"
                      : "Try a different combination."}
                </p>
              </div>
              <p className={styles.compareHint}>
                {bn
                  ? "সর্বোচ্চ ৩টি কোর্স পাশাপাশি তুলনা করুন।"
                  : "Select up to 3 to compare side by side."}
              </p>
            </div>
            {china ? (
              <div className={styles.resultsNotes}>
                <p>
                  {bn
                    ? "একই বিশ্ববিদ্যালয়ে একাধিক কোর্স বা ভর্তির পথ থাকতে পারে।"
                    : "A university can have more than one course or entry route."}
                </p>
                <details className={styles.feeGuide}>
                  <summary>
                    <Info size={15} aria-hidden="true" />
                    {bn ? "ফি কীভাবে পড়বেন" : "How to read the fees"}
                  </summary>
                  <p>
                    {bn
                      ? "CNY ও RMB চীনা মুদ্রার নাম। ‘Semester’ এক টার্মের ফি, ‘year’ এক বছরের। প্যাকেজে কী আছে তা দেখুন। স্কলারশিপের পরের ফি পেতে লিখিত অ্যাওয়ার্ড লাগবে। অনিশ্চিত ফি কোর্সের পেজে নিশ্চিত করুন।"
                      : "CNY and RMB both mean Chinese yuan. A semester fee covers one term; a yearly fee covers one year. Check what each package includes. After-scholarship prices depend on a written award. Open the course for fees that still need confirmation."}
                  </p>
                </details>
              </div>
            ) : null}
            {list.rows.length ? (
              <ul className={styles.cards}>
                {list.rows.map((program) => (
                  <li key={program.id}>
                    <ProgramCard
                      program={program}
                      locale={locale}
                      dict={dict}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>
                <SearchX size={35} aria-hidden="true" />
                <h3>
                  {bn
                    ? "এই পছন্দে কোনো কোর্স পাওয়া যায়নি।"
                    : "No courses match those filters."}
                </h3>
                <p>
                  {bn
                    ? "একটি ফিল্টার সরিয়ে দেখুন, অথবা অন্য বিষয় বা শুরুর তারিখ বেছে নিন।"
                    : "Remove a filter, try another subject or choose a different start date."}
                </p>
                <Link
                  className={styles.submit}
                  href={publicProgramsHref(locale, {
                    country: filters.country,
                    ids: selectedIds,
                  })}
                >
                  {bn
                    ? "এই দেশের সব কোর্স দেখুন"
                    : filters.country
                      ? "See all courses in this country"
                      : "See all courses"}
                </Link>
                <Link
                  href={href(
                    "/consultation" + (china ? "?destination=china" : ""),
                  )}
                  className={styles.helpLink}
                >
                  {bn ? "কাউন্সেলরের সাহায্য নিন" : "Ask a counsellor for help"}
                </Link>
              </div>
            )}
            {list.pageCount > 1 ? (
              <nav
                className={styles.pagination}
                aria-label={bn ? "কোর্সের পাতাগুলো" : "Program pages"}
              >
                {list.page > 1 ? (
                  <Link
                    href={
                      publicProgramsHref(locale, {
                        ...filters,
                        page: list.page - 1,
                        ids: selectedIds,
                      }) + "#program-results"
                    }
                  >
                    {bn ? "আগের পাতা" : "Previous"}
                  </Link>
                ) : (
                  <span />
                )}
                <p>
                  {bn ? "পাতা " : "Page "}
                  {number(list.page)} {bn ? " / " : "of "}
                  {number(list.pageCount)}
                </p>
                {list.page < list.pageCount ? (
                  <Link
                    href={
                      publicProgramsHref(locale, {
                        ...filters,
                        page: list.page + 1,
                        ids: selectedIds,
                      }) + "#program-results"
                    }
                  >
                    {bn ? "পরের পাতা" : "Next"}
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            ) : null}
          </div>
          {list.rows.some((program) => chinaOffers.some((offer) => offer.id === program.id && offer.universityId === "xiamen-university")) ? <Link className={styles.photoCredits} href={href("/destinations/china#china-photo-credits")}>{bn ? "ক্যাম্পাস ছবির কৃতিত্ব ও লাইসেন্স" : "Campus photography credits and license"}</Link> : null}
        <ProgramCompareBar locale={locale} />
        </ProgramCompareProvider>
        <aside className={styles.help}>
          <MessageCircle size={25} aria-hidden="true" />
          <div>
            <h2>
              {bn
                ? "কোন কোর্স দিয়ে শুরু করবেন বুঝতে পারছেন না?"
                : "Not sure which course to start with?"}
            </h2>
            <p>
              {bn
                ? "আপনার ফলাফল আর বাজেট জানান। আমরা কয়েকটি উপযুক্ত বিকল্প দিয়ে শুরু করতে সাহায্য করব। প্রোফাইল মূল্যায়ন ফ্রি।"
                : "Tell us your results and budget. We’ll help you put together a few options. Your profile assessment is free."}
            </p>
          </div>
          <Link
            href={href("/consultation" + (china ? "?destination=china" : ""))}
          >
            {bn ? "কাউন্সেলরের সঙ্গে কথা বলুন" : "Talk to a counsellor"}
          </Link>
        </aside>
      </PageShell>
    </section>
  );
}
