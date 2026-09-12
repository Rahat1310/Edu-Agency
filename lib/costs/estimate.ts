import {
  livingCostCategories,
  type CostEstimateCategory,
  type LivingCostCategory,
  type ProgramCountry,
  type TuitionCurrency,
} from "@/db/schema";
import { toBdt, type BdtRates } from "@/lib/fx/load-rates";

export const LIVING_MONTHS = 12;

export type EstimateRow = {
  category: CostEstimateCategory;
  monthlyAmount: string;
  currency: TuitionCurrency;
};

export type ProgramTuition = {
  id: string;
  universityName: string;
  field: string;
  tuitionAmount: string;
  tuitionCurrency: TuitionCurrency;
};

export type CostLine = {
  category: CostEstimateCategory;
  yearlyLocal: number;
  monthlyLocal: number | null;
  currency: TuitionCurrency;
  yearlyBdt: number;
  source: "program" | "estimate";
};

export type YearlyCostEstimate = {
  destination: ProgramCountry;
  tuition: CostLine | null;
  living: CostLine[];
  livingYearlyLocal: number | null;
  livingYearlyBdt: number;
  headlineLocal: number | null;
  headlineLocalCurrency: TuitionCurrency | null;
  headlineBdt: number;
  tuitionSource: "program" | "estimate" | "missing";
  programLabel: string | null;
};

export function parseAmount(value: string | number): number {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(amount) ? amount : 0;
}

function isLivingCategory(
  category: CostEstimateCategory,
): category is LivingCostCategory {
  return livingCostCategories.includes(category as LivingCostCategory);
}

function sharedCurrency(lines: CostLine[]): TuitionCurrency | null {
  const first = lines[0]?.currency;
  if (!first) {
    return null;
  }
  return lines.every((line) => line.currency === first) ? first : null;
}

/**
 * Tuition (yearly) + 12 × monthly living bands. A published program
 * replaces the generic tuition row; living costs always come from
 * `cost_estimates`.
 */
export function buildYearlyEstimate(input: {
  destination: ProgramCountry;
  rows: readonly EstimateRow[];
  program: ProgramTuition | null;
  rates: Pick<BdtRates, TuitionCurrency>;
}): YearlyCostEstimate {
  const tuitionRow = input.rows.find((row) => row.category === "tuition");

  let tuition: CostLine | null = null;
  let tuitionSource: YearlyCostEstimate["tuitionSource"] = "missing";
  let programLabel: string | null = null;

  if (input.program) {
    const yearlyLocal = parseAmount(input.program.tuitionAmount);
    const currency = input.program.tuitionCurrency;
    tuition = {
      category: "tuition",
      yearlyLocal,
      monthlyLocal: null,
      currency,
      yearlyBdt: toBdt(yearlyLocal, currency, input.rates),
      source: "program",
    };
    tuitionSource = "program";
    programLabel = `${input.program.universityName} — ${input.program.field}`;
  } else if (tuitionRow) {
    const yearlyLocal = parseAmount(tuitionRow.monthlyAmount);
    tuition = {
      category: "tuition",
      yearlyLocal,
      monthlyLocal: null,
      currency: tuitionRow.currency,
      yearlyBdt: toBdt(yearlyLocal, tuitionRow.currency, input.rates),
      source: "estimate",
    };
    tuitionSource = "estimate";
  }

  const living: CostLine[] = [];

  for (const category of livingCostCategories) {
    const row = input.rows.find((item) => item.category === category);
    if (!row || !isLivingCategory(row.category)) {
      continue;
    }
    const monthlyLocal = parseAmount(row.monthlyAmount);
    const yearlyLocal = monthlyLocal * LIVING_MONTHS;
    living.push({
      category,
      yearlyLocal,
      monthlyLocal,
      currency: row.currency,
      yearlyBdt: toBdt(yearlyLocal, row.currency, input.rates),
      source: "estimate",
    });
  }

  const livingCurrency = sharedCurrency(living);
  const livingYearlyLocal = livingCurrency
    ? living.reduce((sum, line) => sum + line.yearlyLocal, 0)
    : null;
  const livingYearlyBdt = living.reduce((sum, line) => sum + line.yearlyBdt, 0);

  const headlineParts = [...(tuition ? [tuition] : []), ...living];
  const headlineLocalCurrency = sharedCurrency(headlineParts);
  const headlineLocal = headlineLocalCurrency
    ? headlineParts.reduce((sum, line) => sum + line.yearlyLocal, 0)
    : null;
  const headlineBdt = headlineParts.reduce(
    (sum, line) => sum + line.yearlyBdt,
    0,
  );

  return {
    destination: input.destination,
    tuition,
    living,
    livingYearlyLocal,
    livingYearlyBdt,
    headlineLocal,
    headlineLocalCurrency,
    headlineBdt,
    tuitionSource,
    programLabel,
  };
}
