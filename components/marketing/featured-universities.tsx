"use client";

import { useId, useState, type Ref } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CountryFlagBadge } from "@/components/marketing/destination-watermarks";
import type { DestinationSlug } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import {
  FEATURED_UNIVERSITIES,
  type FeaturedUniversity,
} from "@/lib/universities-data";
import {
  universityDestinationVisuals,
  universityVisuals,
} from "@/lib/university-visuals";
import { UniversityCardCover } from "./university-card-cover";
import { UniversityPhotoCredit } from "./university-photo-credit";
import styles from "./university-card.module.css";

type FilterTab = "all" | DestinationSlug;

const INITIAL_ROWS_COUNT = 6;

function studyAreaLabel(major: string) {
  const label = major
    .replace(/\((?:honours|hons)\)/gi, "")
    .replace(
      /^(?:bachelor|master)(?:'s)?\s+(?:(?:of|in)\s+)?(?:(?:arts|science)\s+(?:(?:of|in)\s+)?)?/i,
      "",
    )
    .replace(/^(?:diploma|foundation)\s+in\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return label === label.toUpperCase()
    ? label.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
    : label;
}

export function FeaturedUniversities({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_ROWS_COUNT);
  const headingId = useId();
  const reducedMotion = useReducedMotion();

  const filterTabs: { id: FilterTab; label: string; slug?: DestinationSlug }[] =
    [
      { id: "all", label: dict.home.universitiesFilterAll },
      {
        id: "malaysia",
        label: dict.home.universitiesFilterMalaysia,
        slug: "malaysia",
      },
      { id: "china", label: dict.home.universitiesFilterChina, slug: "china" },
      {
        id: "south-korea",
        label: dict.home.universitiesFilterKorea,
        slug: "south-korea",
      },
      { id: "india", label: dict.home.universitiesFilterIndia, slug: "india" },
    ];

  const filteredUniversities =
    activeFilter === "all"
      ? FEATURED_UNIVERSITIES
      : FEATURED_UNIVERSITIES.filter((uni) => uni.country === activeFilter);

  const visibleUniversities = filteredUniversities.slice(0, visibleCount);
  const hasMore = filteredUniversities.length > visibleCount;
  const remainingCount = filteredUniversities.length - visibleCount;

  const handleTabClick = (tabId: FilterTab) => {
    setActiveFilter(tabId);
    setVisibleCount(INITIAL_ROWS_COUNT);
  };

  return (
    <section
      aria-labelledby={headingId}
      className="relative overflow-hidden bg-[#f8f9fa] py-20 sm:py-28"
    >
      {/* Ambient background glows */}

      <PageShell className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            titleId={headingId}
            eyebrow={dict.home.universitiesEyebrow}
            title={
              locale === "bn" ? (
                <>
                  শীর্ষস্থানীয়{" "}
                  <span className="text-[var(--brand-blue)]">
                    বিশ্বমানের ক্যাম্পাসে
                  </span>{" "}
                  সরাসরি ভর্তি
                </>
              ) : (
                <>
                  Direct Gateways to{" "}
                  <span className="text-[var(--brand-blue)]">
                    World-Class Campuses
                  </span>
                </>
              )
            }
            lede={dict.home.universitiesLede}
          />

          {/* Quick Counter Badge */}
          <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-2.5 shadow-2xs backdrop-blur-md sm:flex">
            <GraduationCap className="size-5 text-orange-600" />
            <div className="text-left">
              <span className="block text-xs font-bold text-slate-900">
                {locale === "bn"
                  ? "২০০+ পার্টনার বিশ্ববিদ্যালয়"
                  : "200+ Partner Universities"}
              </span>
              <span className="block text-[0.68rem] font-medium text-slate-500">
                {locale === "bn"
                  ? "১০০% ভেরিফাইড ডিগ্রি"
                  : "100% Verified Degrees"}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Filter Pills with Real SVG Flags */}
        <div className="mt-10 flex flex-wrap items-center gap-2 sm:gap-2.5">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const count =
              tab.id === "all"
                ? FEATURED_UNIVERSITIES.length
                : FEATURED_UNIVERSITIES.filter((u) => u.country === tab.id)
                    .length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                aria-pressed={isActive}
                className={`focus-ring relative inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/15"
                    : "border border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tab.slug && (
                  <CountryFlagBadge
                    slug={tab.slug}
                    className="h-3 w-4.5 shadow-2xs"
                  />
                )}
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Universities Grid */}
        <motion.div
          layout={!reducedMotion}
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visibleUniversities.map((uni, index) => (
              <UniversityCard
                key={uni.id}
                uni={uni}
                locale={locale}
                dict={dict}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load More Button (after 2 rows) */}
        {filteredUniversities.length > INITIAL_ROWS_COUNT && (
          <div className="mt-10 flex justify-center">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="focus-ring group inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-bold text-slate-800 shadow-xs transition-all hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
              >
                <span>{dict.home.universitiesLoadMore}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-700">
                  +{remainingCount}
                </span>
                <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setVisibleCount(INITIAL_ROWS_COUNT)}
                className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>{dict.home.universitiesShowLess}</span>
                <ChevronUp className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Bottom Discovery Banner */}
        <div className="mt-12 overflow-hidden rounded-3xl border-0 bg-[#f6f5f2] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
                <Sparkles className="size-3.5" />
                <span>
                  {locale === "bn"
                    ? "সম্পূর্ণ তালিকা"
                    : "Comprehensive Catalog"}
                </span>
              </div>
              <h3 className="font-heading mt-2.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {locale === "bn"
                  ? "নির্দিষ্ট বিষয় বা ফুল-রাইড স্কলারশিপ খুঁজছেন?"
                  : "Looking for a Specific Degree or Full Scholarship?"}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {locale === "bn"
                  ? "আমাদের প্রোগ্রামের ডিরেক্টরিতে টিউশন ফি, ভর্তির যোগ্যতা ও ডেডলাইনসহ বিস্তারিত তথ্য দেখুন।"
                  : "Filter our complete directory of 120+ accredited bachelor's & master's programs with published tuition & requirements."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={localizedHref("/programs", locale)}
                className="btn-sunset focus-ring inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm"
              >
                <span>{dict.home.universitiesViewAllCta}</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={localizedHref("/eligibility-quiz", locale)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-2xs hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              >
                <span>{dict.home.universitiesQuizCta}</span>
                <ChevronRight className="size-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </PageShell>
    </section>
  );
}

function UniversityCard({
  uni,
  locale,
  dict,
  index,
  ref,
}: {
  uni: FeaturedUniversity;
  locale: Locale;
  dict: Dictionary;
  index: number;
  ref?: Ref<HTMLElement>;
}) {
  const isBn = locale === "bn";
  const reducedMotion = useReducedMotion();
  const countryLabel = isBn ? uni.countryLabel.bn : uni.countryLabel.en;
  const ranking = isBn ? uni.rankingBadge.bn : uni.rankingBadge.en;
  const city = isBn ? uni.city.bn : uni.city.en;
  const descriptor =
    uni.country === "malaysia" || ranking.includes(city)
      ? ranking
      : `${city} · ${ranking}`;
  const scholarship = isBn ? uni.scholarshipInfo.bn : uni.scholarshipInfo.en;
  const majors = isBn ? uni.popularMajors.bn : uni.popularMajors.en;
  const tuition = isBn ? uni.tuitionEst.bn : uni.tuitionEst.en;
  const campusPhoto = universityVisuals[uni.name];
  const photo = campusPhoto ?? universityDestinationVisuals[uni.country];
  const programsHref = localizedHref(
    `/programs?country=${uni.programsHrefCountry}&university=${encodeURIComponent(uni.name.replace(/\s*\([^)]*\)$/, ""))}`,
    locale,
  );

  return (
    <motion.article
      ref={ref}
      layout={!reducedMotion}
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
      transition={{
        duration: reducedMotion ? 0 : 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={styles.card}
      data-country={uni.country}
      data-university-card
    >
      <div className={styles.media}>
        <Link
          href={programsHref}
          className={styles.coverButton}
          aria-label={`${isBn ? "বিশ্ববিদ্যালয় দেখুন:" : "Discover"} ${uni.name}`}
        >
          <UniversityCardCover
            name={uni.name}
            country={countryLabel}
            countryCode={uni.country}
            locale={locale}
            photo={photo}
            campusPhoto={Boolean(campusPhoto)}
            index={index}
          />
        </Link>
        <UniversityPhotoCredit photo={photo} />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={programsHref} className={styles.titleButton}>
            {uni.name}
          </Link>
        </h3>
        <p className={styles.descriptor}>
          <Award size={13} strokeWidth={1.5} aria-hidden="true" />
          <span>{descriptor}</span>
        </p>
        <div
          className={styles.keywords}
          aria-label={isBn ? "পড়ার বিষয়" : "Areas of study"}
        >
          {majors.map((major) => (
            <span key={major}>{studyAreaLabel(major)}</span>
          ))}
        </div>
        <details className={styles.scholarship}>
          <summary>
            <span className={styles.scholarshipIcon}>
              {uni.has100PercentScholarship ? (
                <Sparkles size={16} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={16} strokeWidth={1.5} aria-hidden="true" />
              )}
            </span>
            <span className={styles.scholarshipTitle}>
              {uni.has100PercentScholarship
                ? uni.country === "china"
                  ? isBn
                    ? "প্রতিযোগিতামূলক পূর্ণ বৃত্তি"
                    : "Competitive full scholarships"
                  : isBn
                    ? "১০০% বৃত্তির সুযোগ"
                    : "100% scholarship opportunities"
                : isBn
                  ? "বৃত্তি ও ভর্তির তথ্য"
                  : "Scholarships & entry details"}
            </span>
            <ChevronDown
              size={14}
              className={styles.scholarshipChevron}
              aria-hidden="true"
            />
          </summary>
          <p>{scholarship}</p>
        </details>
        <div className={styles.featuredFooter}>
          <div className={styles.tuition}>
            <span>{dict.home.universitiesEstTuitionLabel}</span>
            <strong>{tuition}</strong>
          </div>
          <Link
            href={programsHref}
            className={styles.featuredLink}
            aria-label={`${dict.home.universitiesExplorePrograms}: ${uni.name}`}
          >
            <span>{dict.home.universitiesExplorePrograms}</span>
            <span className={styles.arrow}>
              <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
