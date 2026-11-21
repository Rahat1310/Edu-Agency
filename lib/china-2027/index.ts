import rawOffers from "./offers.json";
import type { ChinaOffer } from "./types";
import type {
  PublicProgramDetail,
  PublicProgramFilters,
} from "@/lib/programs-public";

export const chinaOffers = rawOffers as ChinaOffer[];
export const chinaInstitutions = [
  ...new Map(
    chinaOffers.map((offer) => [
      offer.universityId,
      { id: offer.universityId, name: offer.university },
    ]),
  ).values(),
].sort((a, b) => a.name.localeCompare(b.name));
export const chinaIntakes = [
  "March 2027",
  "September 2027",
  "Rolling enrollment",
  "Intake to be confirmed",
] as const;
const byId = new Map(chinaOffers.map((offer) => [offer.id, offer]));

export function parseChinaOfferFilters(input: {
  country?: string;
  intake?: string;
  university?: string;
  language?: string;
  scholarship?: string;
}) {
  const enabled = input.country === "china";
  return {
    intake: enabled
      ? (chinaIntakes.find((intake) => intake === input.intake) ?? "")
      : "",
    university:
      enabled &&
      chinaInstitutions.some((university) => university.id === input.university)
        ? (input.university ?? "")
        : "",
    language:
      enabled && ["English", "Chinese"].includes(input.language ?? "")
        ? (input.language ?? "")
        : "",
    scholarship: enabled && input.scholarship === "1",
  };
}

export function getChinaOffer(id: string) {
  return byId.get(id);
}

// A shared or unconfirmed route must not silently preselect September.
export function chinaAssessmentIntake(offer: ChinaOffer) {
  const entries = offer.entryIntakes ?? [offer.intake];
  if (entries.length !== 1) return "";
  return entries[0] === "March 2027"
    ? "2027-03"
    : entries[0] === "September 2027"
      ? "2027-09"
      : "";
}

export function filterChinaOffers(filters: Partial<PublicProgramFilters>) {
  if (filters.country && filters.country !== "china") return [];
  const search = filters.field?.trim().toLocaleLowerCase() ?? "";
  return chinaOffers.filter(
    (offer) =>
      (!filters.level ||
        (offer.categories ?? [offer.level]).some(
          (level) => level === filters.level,
        )) &&
      (!filters.intake ||
        (offer.entryIntakes ?? [offer.intake]).includes(filters.intake)) &&
      (!filters.university ||
        offer.universityId === filters.university ||
        offer.university
          .toLowerCase()
          .includes(filters.university.toLowerCase())) &&
      (!filters.language || offer.language.includes(filters.language)) &&
      (!filters.scholarship || offer.scholarship.available) &&
      (!search ||
        [offer.university, offer.title, offer.location, ...offer.majors]
          .join(" ")
          .toLocaleLowerCase()
          .includes(search)),
  );
}

export function chinaOfferProgram(offer: ChinaOffer): PublicProgramDetail {
  return {
    id: offer.id,
    universityName: offer.university,
    country: "china",
    level: offer.level,
    field: offer.title,
    tuitionAmount:
      offer.tuition.amount == null ? "" : String(offer.tuition.amount),
    tuitionCurrency: "CNY",
    tuitionDisplay: offer.tuition.display,
    intakeMonths: offer.entryIntakes ?? [offer.intake],
    requirements: [
      ...offer.requirements,
      ...offer.notes,
      ...(offer.progressionStart
        ? [`Degree progression: ${offer.progressionStart}`]
        : []),
    ].join("\n\n"),
    scholarshipInfo: [
      offer.scholarship.summary,
      ...offer.scholarship.details,
    ].join("\n\n"),
  };
}

export function hasChinaOnlyFilters(filters: Partial<PublicProgramFilters>) {
  return Boolean(
    filters.intake ||
    (filters.country === "china" && filters.university) ||
    filters.language ||
    filters.scholarship ||
    filters.level === "foundation" ||
    filters.level === "foundation_bachelor",
  );
}

export const chinaRankingEdition = 2027;
export const chinaRankingsCheckedOn = "2026-11-21";

export const chinaRankingExamples = [
  {
    name: "Tongji University",
    rank: 146,
    tied: false,
    city: "Shanghai",
    id: "tongji-university",
    url: "https://www.topuniversities.com/universities/tongji-university",
  },
  {
    name: "Xi’an Jiaotong University",
    rank: 296,
    tied: true,
    city: "Xi’an",
    id: "xi-an-jiaotong-university",
    url: "https://www.topuniversities.com/universities/xian-jiaotong-university",
  },
  {
    name: "Xiamen University",
    rank: 303,
    tied: true,
    city: "Xiamen",
    id: "xiamen-university",
    url: "https://www.topuniversities.com/universities/xiamen-university",
  },
  {
    name: "Huazhong University of Science and Technology",
    rank: 307,
    tied: false,
    city: "Wuhan",
    id: "huazhong-university-of-science-and-technology",
    url: "https://www.topuniversities.com/universities/huazhong-university-science-technology",
  },
  {
    name: "South China University of Technology",
    rank: 342,
    tied: true,
    city: "Guangzhou",
    id: "south-china-university-of-technology",
    url: "https://www.topuniversities.com/universities/south-china-university-technology",
  },
] as const;
