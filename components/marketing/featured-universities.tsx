"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  CheckCircle2,
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

type FilterTab = "all" | DestinationSlug;

const INITIAL_ROWS_COUNT = 6;

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
      className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-slate-100/40 py-20 sm:py-28"
    >
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute top-12 -left-32 size-96 rounded-full bg-orange-400/8 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 bottom-12 size-96 rounded-full bg-blue-400/8 blur-[120px]"
        aria-hidden="true"
      />

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
                  <span className="bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                    বিশ্বমানের ক্যাম্পাসে
                  </span>{" "}
                  সরাসরি ভর্তি
                </>
              ) : (
                <>
                  Direct Gateways to{" "}
                  <span className="bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
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
                  ? "৪০+ পার্টনার ক্যাম্পাস"
                  : "40+ Partner Campuses"}
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
          layout
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visibleUniversities.map((uni) => (
              <UniversityCard
                key={uni.id}
                uni={uni}
                locale={locale}
                dict={dict}
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
        <div className="mt-12 overflow-hidden rounded-3xl border border-orange-200/60 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/80 p-6 shadow-sm sm:p-8">
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
              <h3 className="font-heading mt-2.5 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
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
                className="btn-sunset focus-ring inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98]"
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
}: {
  uni: FeaturedUniversity;
  locale: Locale;
  dict: Dictionary;
}) {
  const isBn = locale === "bn";
  const countryLabel = isBn ? uni.countryLabel.bn : uni.countryLabel.en;
  const city = isBn ? uni.city.bn : uni.city.en;
  const ranking = isBn ? uni.rankingBadge.bn : uni.rankingBadge.en;
  const scholarship = isBn ? uni.scholarshipInfo.bn : uni.scholarshipInfo.en;
  const majors = isBn ? uni.popularMajors.bn : uni.popularMajors.en;
  const tuition = isBn ? uni.tuitionEst.bn : uni.tuitionEst.en;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-orange-300/80 hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div>
        {/* Top Header: Flag + Country + City & Ranking Badge */}
        <div className="flex items-center justify-between gap-2">
          {/* Country Flag (authentic SVG) + Location */}
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
            <CountryFlagBadge
              slug={uni.country}
              className="h-3 w-4.5 shadow-2xs"
            />
            <span>{countryLabel}</span>
            <span className="text-slate-300">·</span>
            <span className="line-clamp-1 text-slate-500">{city}</span>
          </div>

          {/* Ranking Badge */}
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-200/90 bg-amber-50/80 px-2.5 py-0.5 text-[0.68rem] font-bold text-amber-900">
            <Award className="size-3 shrink-0 text-amber-600" />
            <span>{ranking}</span>
          </div>
        </div>

        {/* University Name */}
        <div className="mt-4">
          <h3 className="font-heading text-lg font-black tracking-tight text-slate-900 transition-colors group-hover:text-orange-600 sm:text-xl">
            {uni.name}
          </h3>
        </div>

        {/* Scholarship Container */}
        <div
          className={`mt-4 rounded-2xl border p-3 transition-colors ${
            uni.has100PercentScholarship
              ? "border-emerald-300/90 bg-emerald-50/90 shadow-2xs"
              : "border-slate-200/90 bg-slate-50/80"
          }`}
        >
          <div className="flex items-center gap-1.5">
            {uni.has100PercentScholarship ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[0.68rem] font-black tracking-wide text-white uppercase shadow-2xs">
                  <Sparkles className="size-2.5" />
                  {isBn ? "১০০% সম্পূর্ণ বৃত্তি" : "100% Scholarship Available"}
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-[0.68rem] font-bold text-slate-800 uppercase">
                  <CheckCircle2 className="size-2.5 text-slate-600" />
                  {isBn ? "মেধা বৃত্তি সুবিধা" : "Merit Scholarship Available"}
                </span>
              </>
            )}
          </div>
          <p
            className={`mt-1.5 text-xs leading-relaxed font-semibold ${
              uni.has100PercentScholarship
                ? "font-bold text-emerald-950"
                : "text-slate-700"
            }`}
          >
            {scholarship}
          </p>
        </div>

        {/* Popular Majors Chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {majors.map((major) => (
            <span
              key={major}
              className="inline-flex items-center rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 text-[0.72rem] font-medium text-slate-700 shadow-2xs"
            >
              {major}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Estimated Tuition & Action Link */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <span className="block text-[0.65rem] font-bold tracking-wider text-slate-400 uppercase">
            {dict.home.universitiesEstTuitionLabel}
          </span>
          <span className="font-heading text-xs font-bold text-slate-800">
            {tuition}
          </span>
        </div>

        <Link
          href={localizedHref(
            `/programs?country=${uni.programsHrefCountry}`,
            locale,
          )}
          className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-orange-600 transition-colors group-hover:translate-x-0.5 hover:text-orange-700"
        >
          <span>{dict.home.universitiesExplorePrograms}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
