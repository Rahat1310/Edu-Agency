import type { ProgramCountry, ProgramLevel } from "@/db/schema";
import type { ChinaOffer } from "@/lib/china-2027/types";
import type { Locale } from "@/lib/i18n/config";
import type { PublicProgramFilters } from "@/lib/programs-public";

const countryNames: Record<ProgramCountry, [string, string]> = {
  china: ["China", "চীন"],
  india: ["India", "ভারত"],
  malaysia: ["Malaysia", "মালয়েশিয়া"],
  south_korea: ["South Korea", "দক্ষিণ কোরিয়া"],
};
const levelNames: Record<ProgramLevel, [string, string]> = {
  bachelor: ["Bachelor’s degree", "স্নাতক"],
  master: ["Master’s degree", "মাস্টার্স"],
  phd: ["PhD", "পিএইচডি"],
  language: ["Language course", "ভাষা কোর্স"],
  diploma: ["Diploma", "ডিপ্লোমা"],
  foundation: ["Foundation course", "ফাউন্ডেশন কোর্স"],
  foundation_bachelor: ["Foundation then bachelor’s", "ফাউন্ডেশন থেকে স্নাতক"],
};

export const programCountryText = (country: ProgramCountry, locale: Locale) =>
  countryNames[country][locale === "bn" ? 1 : 0];
export const programLevelText = (level: ProgramLevel, locale: Locale) =>
  levelNames[level][locale === "bn" ? 1 : 0];

export function programIntakeText(intake: string, locale: Locale) {
  if (locale !== "bn") return intake;
  const labels: Record<string, string> = {
    "March 2027": "মার্চ ২০২৭",
    "September 2027": "সেপ্টেম্বর ২০২৭",
    "Rolling enrollment": "সারা বছর ভর্তি",
    "Intake to be confirmed": "শুরুর তারিখ নিশ্চিত করা বাকি",
  };
  return labels[intake] ?? intake;
}

export function changeProgramCountry(
  filters: PublicProgramFilters,
  country: PublicProgramFilters["country"],
): PublicProgramFilters {
  if (country === filters.country) return filters;
  return {
    ...filters,
    country,
    page: 1,
    university: "",
    intake: "",
    language: "",
    scholarship: false,
    level:
      (country === "china" && filters.level === "diploma") ||
      (country &&
        country !== "china" &&
        ["foundation", "foundation_bachelor"].includes(filters.level))
        ? ""
        : filters.level,
  };
}

export type RemovableProgramFilter =
  | "country"
  | "level"
  | "field"
  | "intake"
  | "university"
  | "language"
  | "scholarship";
export function removeProgramFilter(
  filters: PublicProgramFilters,
  key: RemovableProgramFilter,
): PublicProgramFilters {
  if (key === "country") return changeProgramCountry(filters, "");
  return { ...filters, [key]: key === "scholarship" ? false : "", page: 1 };
}

// Identify the question a student needs answered without exposing audit notes.
export function programReviewLabels(offer: ChinaOffer, locale: Locale) {
  if (offer.eligibility !== "confirm") return [];
  const bn = locale === "bn";
  const notes = [...offer.notes, offer.tuition.display].join(" ").toLowerCase();
  const labels: string[] = [];
  if (offer.language === "To be confirmed")
    labels.push(
      bn ? "পড়ার মাধ্যম নিশ্চিত করতে হবে" : "Teaching language to confirm",
    );
  if (
    offer.tuition.amount == null ||
    /tuition|fees?|refund|charges|payment/.test(notes)
  )
    labels.push(bn ? "ফি নিশ্চিত করতে হবে" : "Fees to confirm");
  if (/scholarship|award/.test(notes))
    labels.push(
      bn ? "স্কলারশিপের শর্ত নিশ্চিত করতে হবে" : "Scholarship terms to confirm",
    );
  if (/deadline|intake|start date|entry date/.test(notes))
    labels.push(
      bn ? "ভর্তির তারিখ নিশ্চিত করতে হবে" : "Admission dates to confirm",
    );
  if (!labels.length)
    labels.push(
      bn ? "ভর্তির শর্ত নিশ্চিত করতে হবে" : "Entry requirements to confirm",
    );
  return labels.slice(0, 2);
}
