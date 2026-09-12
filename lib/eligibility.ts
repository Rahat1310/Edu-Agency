/**
 * Rule-based eligibility only. This module must stay free of network
 * and LLM calls — thresholds live in `eligibilityRules` so they can be
 * tuned without changing `scoreEligibility`.
 */

export const eligibilityDestinations = [
  "china",
  "india",
  "malaysia",
  "south_korea",
] as const;

export const educationLevels = [
  "hsc",
  "bachelor",
  "master",
  "diploma",
] as const;

export const budgetBands = [
  "under_8l",
  "8_15l",
  "15_25l",
  "over_25l",
] as const;

export const eligibilityVerdicts = ["strong", "possible", "stretch"] as const;

export type EligibilityDestination = (typeof eligibilityDestinations)[number];
export type EducationLevel = (typeof educationLevels)[number];
export type BudgetBand = (typeof budgetBands)[number];
export type EligibilityVerdict = (typeof eligibilityVerdicts)[number];

export type EligibilityAnswers = {
  educationLevel: EducationLevel;
  destination: EligibilityDestination;
  ielts?: number;
  toefl?: number;
  hsk?: number;
  topik?: number;
  budget: BudgetBand;
};

export const eligibilityReasonKeys = [
  "education.preferred",
  "education.accepted",
  "education.gap",
  "language.hsk.met",
  "language.hsk.below",
  "language.topik.met",
  "language.topik.below",
  "language.ielts.met",
  "language.ielts.below",
  "language.toefl.met",
  "language.toefl.below",
  "language.none",
  "budget.met",
  "budget.close",
  "budget.short",
  "route.china",
  "route.india",
  "route.malaysia",
  "route.south_korea",
] as const;

export type EligibilityReason = (typeof eligibilityReasonKeys)[number];

export type EligibilityResult = {
  destination: EligibilityDestination;
  verdict: EligibilityVerdict;
  score: number;
  reasons: EligibilityReason[];
};

export type StoredQuizAnswers = EligibilityAnswers & {
  result: EligibilityResult;
};

export type EligibilityRule = {
  minIelts: number;
  minToefl: number;
  minHsk?: number;
  minTopik?: number;
  minBudget: BudgetBand;
  acceptedEducation: readonly EducationLevel[];
  preferredEducation: readonly EducationLevel[];
};

/**
 * Starting thresholds for a Bangladesh-source desk. Adjust numbers
 * here; leave `scoreEligibility` alone unless the shape of a rule changes.
 */
export const eligibilityRules: Record<EligibilityDestination, EligibilityRule> =
  {
    china: {
      minIelts: 5.5,
      minToefl: 70,
      minHsk: 3,
      minBudget: "8_15l",
      acceptedEducation: ["hsc", "bachelor", "master", "diploma"],
      preferredEducation: ["hsc", "bachelor"],
    },
    india: {
      minIelts: 6,
      minToefl: 80,
      minBudget: "under_8l",
      acceptedEducation: ["hsc", "bachelor", "master", "diploma"],
      preferredEducation: ["hsc", "bachelor"],
    },
    malaysia: {
      minIelts: 6,
      minToefl: 79,
      minBudget: "15_25l",
      acceptedEducation: ["hsc", "bachelor", "master", "diploma"],
      preferredEducation: ["hsc", "diploma", "bachelor"],
    },
    south_korea: {
      minIelts: 5.5,
      minToefl: 70,
      minTopik: 3,
      minBudget: "15_25l",
      acceptedEducation: ["hsc", "bachelor", "master", "diploma"],
      preferredEducation: ["bachelor", "master"],
    },
  };

const budgetOrder: readonly BudgetBand[] = budgetBands;

const destinationRouteReason: Record<
  EligibilityDestination,
  EligibilityReason
> = {
  china: "route.china",
  india: "route.india",
  malaysia: "route.malaysia",
  south_korea: "route.south_korea",
};

function hasScore(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function scoreEducation(
  level: EducationLevel,
  rules: EligibilityRule,
): { points: number; reason: EligibilityReason } {
  if (rules.preferredEducation.includes(level)) {
    return { points: 30, reason: "education.preferred" };
  }

  if (rules.acceptedEducation.includes(level)) {
    return { points: 18, reason: "education.accepted" };
  }

  return { points: 0, reason: "education.gap" };
}

function englishMet(
  answers: EligibilityAnswers,
  rules: EligibilityRule,
): "ielts" | "toefl" | null {
  const ielts = answers.ielts;
  const toefl = answers.toefl;
  const ieltsOk = hasScore(ielts) && ielts >= rules.minIelts;
  const toeflOk = hasScore(toefl) && toefl >= rules.minToefl;

  if (ieltsOk && toeflOk && hasScore(ielts) && hasScore(toefl)) {
    const ieltsMargin = ielts - rules.minIelts;
    const toeflMargin = (toefl - rules.minToefl) / 10;
    return ieltsMargin >= toeflMargin ? "ielts" : "toefl";
  }

  if (ieltsOk) {
    return "ielts";
  }

  if (toeflOk) {
    return "toefl";
  }

  return null;
}

function scoreLanguage(
  answers: EligibilityAnswers,
  rules: EligibilityRule,
): { points: number; reason: EligibilityReason } {
  if (rules.minHsk !== undefined && hasScore(answers.hsk)) {
    if (answers.hsk >= rules.minHsk) {
      return { points: 40, reason: "language.hsk.met" };
    }

    return { points: 14, reason: "language.hsk.below" };
  }

  if (rules.minTopik !== undefined && hasScore(answers.topik)) {
    if (answers.topik >= rules.minTopik) {
      return { points: 40, reason: "language.topik.met" };
    }

    return { points: 14, reason: "language.topik.below" };
  }

  const english = englishMet(answers, rules);

  const englishPoints = rules.minHsk || rules.minTopik ? 32 : 40;

  if (english === "ielts") {
    return { points: englishPoints, reason: "language.ielts.met" };
  }

  if (english === "toefl") {
    return { points: englishPoints, reason: "language.toefl.met" };
  }

  if (hasScore(answers.ielts)) {
    return { points: 10, reason: "language.ielts.below" };
  }

  if (hasScore(answers.toefl)) {
    return { points: 10, reason: "language.toefl.below" };
  }

  return { points: 5, reason: "language.none" };
}

function scoreBudget(
  budget: BudgetBand,
  minimum: BudgetBand,
): { points: number; reason: EligibilityReason } {
  const have = budgetOrder.indexOf(budget);
  const need = budgetOrder.indexOf(minimum);

  if (have >= need) {
    return { points: 30, reason: "budget.met" };
  }

  if (have === need - 1) {
    return { points: 14, reason: "budget.close" };
  }

  return { points: 0, reason: "budget.short" };
}

function verdictFor(score: number): EligibilityVerdict {
  if (score >= 72) {
    return "strong";
  }

  if (score >= 46) {
    return "possible";
  }

  return "stretch";
}

export function scoreEligibility(
  answers: EligibilityAnswers,
): EligibilityResult {
  const rules = eligibilityRules[answers.destination];
  const education = scoreEducation(answers.educationLevel, rules);
  const language = scoreLanguage(answers, rules);
  const budget = scoreBudget(answers.budget, rules.minBudget);
  const score = education.points + language.points + budget.points;

  return {
    destination: answers.destination,
    verdict: verdictFor(score),
    score,
    reasons: [
      education.reason,
      language.reason,
      budget.reason,
      destinationRouteReason[answers.destination],
    ],
  };
}

export function isEligibilityDestination(
  value: string,
): value is EligibilityDestination {
  return (eligibilityDestinations as readonly string[]).includes(value);
}

export function destinationFromParam(
  value: string | undefined | null,
): EligibilityDestination | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "south-korea") {
    return "south_korea";
  }

  if (isEligibilityDestination(value)) {
    return value;
  }

  return undefined;
}
