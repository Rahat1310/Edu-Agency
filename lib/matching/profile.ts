import { createHash } from "node:crypto";

import type { LeadDestinationInterest } from "@/db/schema";
import {
  budgetBands,
  educationLevels,
  eligibilityDestinations,
  type BudgetBand,
  type EducationLevel,
  type EligibilityDestination,
} from "@/lib/eligibility";
import type { MatchProfileDraft } from "@/lib/matching/types";

export const MATCH_SHORTLIST_CAP = 20;
export const MATCH_TOP_N = 5;
export const MATCH_CACHE_TTL_SECONDS = 3 * 24 * 60 * 60;
export const MATCH_CACHE_KEY_PREFIX = "ai:match:v1";

export type StudentMatchProfile = {
  educationLevel: EducationLevel;
  destinations: EligibilityDestination[];
  ielts?: number;
  toefl?: number;
  hsk?: number;
  topik?: number;
  budget: BudgetBand;
};

const destinationSet = new Set<string>(eligibilityDestinations);
const educationSet = new Set<string>(educationLevels);
const budgetSet = new Set<string>(budgetBands);

function optionalScore(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function parseDestinations(value: unknown): EligibilityDestination[] {
  if (!Array.isArray(value)) {
    if (typeof value === "string" && destinationSet.has(value)) {
      return [value as EligibilityDestination];
    }
    return [];
  }

  const unique: EligibilityDestination[] = [];
  for (const item of value) {
    if (
      typeof item === "string" &&
      destinationSet.has(item) &&
      !unique.includes(item as EligibilityDestination)
    ) {
      unique.push(item as EligibilityDestination);
    }
  }

  return unique;
}

export function parseStudentMatchProfile(
  value: unknown,
): StudentMatchProfile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const educationLevel = record.educationLevel;
  const budget = record.budget;
  const destinations = parseDestinations(
    record.destinations ?? record.destination,
  );

  if (
    typeof educationLevel !== "string" ||
    !educationSet.has(educationLevel) ||
    typeof budget !== "string" ||
    !budgetSet.has(budget) ||
    destinations.length === 0
  ) {
    return null;
  }

  return {
    educationLevel: educationLevel as EducationLevel,
    destinations,
    budget: budget as BudgetBand,
    ielts: optionalScore(record.ielts),
    toefl: optionalScore(record.toefl),
    hsk: optionalScore(record.hsk),
    topik: optionalScore(record.topik),
  };
}

export function profileFromLeadContext(input: {
  savedProfile: unknown;
  quizAnswers: unknown;
  destinationInterest: LeadDestinationInterest;
}): StudentMatchProfile | null {
  const saved = parseStudentMatchProfile(input.savedProfile);
  if (saved) {
    return saved;
  }

  const fromQuiz = parseStudentMatchProfile(input.quizAnswers);
  if (fromQuiz) {
    return fromQuiz;
  }

  return null;
}

export function canonicalProfile(profile: StudentMatchProfile): string {
  return JSON.stringify({
    educationLevel: profile.educationLevel,
    destinations: [...profile.destinations].sort(),
    ielts: profile.ielts ?? null,
    toefl: profile.toefl ?? null,
    hsk: profile.hsk ?? null,
    topik: profile.topik ?? null,
    budget: profile.budget,
  });
}

export function profileHash(profile: StudentMatchProfile): string {
  return createHash("sha256").update(canonicalProfile(profile)).digest("hex");
}

export function matchCacheKey(profile: StudentMatchProfile): string {
  return `${MATCH_CACHE_KEY_PREFIX}:${profileHash(profile)}`;
}

export function matchProfileDraft(input: {
  savedProfile: unknown;
  quizAnswers: unknown;
  destinationInterest: LeadDestinationInterest;
}): MatchProfileDraft {
  const profile = profileFromLeadContext(input);
  if (profile) {
    return {
      educationLevel: profile.educationLevel,
      destinations: profile.destinations,
      ielts: profile.ielts,
      toefl: profile.toefl,
      hsk: profile.hsk,
      topik: profile.topik,
      budget: profile.budget,
    };
  }

  return {
    educationLevel: "",
    destinations:
      input.destinationInterest === "undecided"
        ? []
        : [input.destinationInterest],
    budget: "",
  };
}

export function toStoredMatchProfile(
  profile: StudentMatchProfile,
): StudentMatchProfile {
  return {
    educationLevel: profile.educationLevel,
    destinations: [...profile.destinations],
    budget: profile.budget,
    ...(profile.ielts != null ? { ielts: profile.ielts } : {}),
    ...(profile.toefl != null ? { toefl: profile.toefl } : {}),
    ...(profile.hsk != null ? { hsk: profile.hsk } : {}),
    ...(profile.topik != null ? { topik: profile.topik } : {}),
  };
}
