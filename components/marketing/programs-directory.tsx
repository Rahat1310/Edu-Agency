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
import { UniversityCard } from "@/components/marketing/university-card";
import { getChinaOffer } from "@/lib/china-2027";
import { malaysiaLevelLabel } from "@/lib/malaysia/copy";
import {
  universityDestinationVisuals,
  universityVisuals,
} from "@/lib/university-visuals";
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
  type PublicProgramCard,
} from "@/lib/programs-public";
import styles from "./programs-directory.module.css";

type ProgramsDirectoryProps = {
  locale: Locale;
  dict: Dictionary;
  filters: PublicProgramFilters;
  list: PublicProgramList;
  selectedIds: string[];
};

function universityKeywords(programs: PublicProgramCard[], locale: Locale) {
  const bn = locale === "bn";
  const subjects = programs
    .flatMap((program) => {
      const offer = getChinaOffer(program.id);
      return offer?.majors.length ? offer.majors : [program.field];
    })
    .join(" ");
  const areas: [RegExp, string, string][] = [
    [
      /business|management|marketing|commerce|administration/i,
      "Business",
      "ব্যবসায় শিক্ষা",
    ],
    [
      /comput|software|information technology|cyber|artificial intelligence|data science/i,
      "Computing & IT",
      "কম্পিউটিং ও আইটি",
    ],
    [/engineer|robotics|mechatronic/i, "Engineering", "ইঞ্জিনিয়ারিং"],
    [
      /design|animation|creative|architecture|fashion|multimedia/i,
      "Design & creativity",
      "ডিজাইন ও সৃজনশীলতা",
    ],
    [
      /medicin|mbbs|nurs|pharma|health|clinical|dent/i,
      "Health sciences",
      "স্বাস্থ্যবিজ্ঞান",
    ],
    [/education|teaching|pedagogy/i, "Education", "শিক্ষা"],
    [
      /account|finance|banking|economics/i,
      "Finance & economics",
      "অর্থায়ন ও অর্থনীতি",
    ],
    [/\blaw\b|legal/i, "Law", "আইন"],
    [/language|chinese|mandarin|linguistic/i, "Languages", "ভাষা শিক্ষা"],
    [
      /media|communication|journalism|film/i,
      "Media & communication",
      "মিডিয়া ও যোগাযোগ",
    ],
    [/hospitality|tourism|culinary|hotel/i, "Hospitality", "হসপিটালিটি"],
    [/psychology|social|sociology/i, "Social sciences", "সমাজবিজ্ঞান"],
    [/biology|chemistry|physics|mathematics|science/i, "Sciences", "বিজ্ঞান"],
  ];
  const matches = areas
    .filter(([pattern]) => pattern.test(subjects))
    .slice(0, 3)
    .map(([, en, label]) => (bn ? label : en));
  return matches.length
    ? matches
    : [
        ...new Set(
          programs.map((program) => programLevelText(program.level, locale)),
        ),
      ].slice(0, 3);
}

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
  const grouped = new Map<string, typeof list.rows>();
  for (const program of list.rows) {
    const key = `${program.country}:${program.universityName}`;
    grouped.set(key, [...(grouped.get(key) ?? []), program]);
  }
  const start = list.total ? (list.page - 1) * PUBLIC_PROGRAM_PAGE_SIZE + 1 : 0;
  const end = list.total ? start + grouped.size - 1 : 0;
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
              {bn ? "বিশ্ববিদ্যালয় ও ভর্তি" : "UNIVERSITIES & ADMISSIONS"}
            </p>
            <h1>
              {china
                ? bn
                  ? "চীনে আপনার বিশ্ববিদ্যালয় খুঁজুন।"
                  : "Find your university in China."
                : bn
                  ? "আপনার বিশ্ববিদ্যালয় খুঁজে নিন।"
                  : "Find your university."}
            </h1>
            <p className={styles.intro}>
              {bn
                ? "বিশ্ববিদ্যালয় অনুযায়ী প্রোগ্রাম, আপডেট করা ফি এবং ক্লাস শুরুর তারিখ দেখুন।"
                : "Browse universities and explore their programs, updated fees and start dates."}
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
                    ? "টি বিশ্ববিদ্যালয়"
                    : list.total === 1
                      ? "university"
                      : "universities"}
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
                {[...grouped].map(([key, programs], index) => {
                  const university = programs[0]!;
                  const campusPhoto =
                    universityVisuals[university.universityName];
                  const photo =
                    campusPhoto ??
                    universityDestinationVisuals[university.country];
                  const levels = [
                    ...new Set(
                      programs.map((program) =>
                        program.catalogueLevel
                          ? malaysiaLevelLabel(program.catalogueLevel, locale)
                          : programLevelText(program.level, locale),
                      ),
                    ),
                  ];
                  return (
                    <UniversityCard
                      key={key}
                      name={university.universityName}
                      country={programCountryText(university.country, locale)}
                      countryCode={university.country}
                      locale={locale}
                      count={programs.length}
                      levels={levels}
                      keywords={universityKeywords(programs, locale)}
                      photo={photo}
                      campusPhoto={Boolean(campusPhoto)}
                      index={index}
                    >
                      <ul className={styles.nestedPrograms}>
                        {programs.map((program) => (
                          <li key={program.id}>
                            <ProgramCard
                              program={program}
                              locale={locale}
                              dict={dict}
                            />
                          </li>
                        ))}
                      </ul>
                    </UniversityCard>
                  );
                })}
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
            {list.rows.length ? (
              <details className={styles.directoryCredits}>
                <summary>{bn ? "ছবির সূত্র" : "Photography & credits"}</summary>
                <p>
                  {bn
                    ? "ক্যাম্পাসের ছবি না থাকলে দেশের দৃশ্য দেখানো হয়েছে এবং তা চিহ্নিত করা আছে।"
                    : "Cards marked ‘Destination preview’ show the study destination. Campus photographs are used where available."}
                </p>
                <ul>
                  {[
                    ...new Map(
                      [...grouped.values()].flatMap((programs) => {
                        const university = programs[0]!;
                        const photo =
                          universityVisuals[university.universityName] ??
                          universityDestinationVisuals[university.country];
                        return photo ? [[photo.src, photo] as const] : [];
                      }),
                    ).values(),
                  ].map((photo) => (
                    <li key={photo.src}>
                      <a href={photo.source} target="_blank" rel="noreferrer">
                        {photo.credit}
                      </a>
                      {photo.license ? (
                        <>
                          {" "}
                          ·{" "}
                          <a
                            href={photo.license}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {bn ? "লাইসেন্স" : "License"}
                          </a>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
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
          {list.rows.some((program) =>
            chinaOffers.some(
              (offer) =>
                offer.id === program.id &&
                offer.universityId === "xiamen-university",
            ),
          ) ? (
            <Link
              className={styles.photoCredits}
              href={href("/destinations/china#china-photo-credits")}
            >
              {bn
                ? "ক্যাম্পাস ছবির কৃতিত্ব ও লাইসেন্স"
                : "Campus photography credits and license"}
            </Link>
          ) : null}
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
