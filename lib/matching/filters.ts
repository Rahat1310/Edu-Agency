import type { ProgramLevel } from "@/db/schema";
import type { BudgetBand, EducationLevel } from "@/lib/eligibility";
import { MATCH_SHORTLIST_CAP } from "@/lib/matching/profile";

/** Program levels that can follow the student's current education. */
export function levelsForEducation(
  education: EducationLevel,
): readonly ProgramLevel[] {
  switch (education) {
    case "hsc":
      return ["bachelor", "diploma", "language"];
    case "bachelor":
      return ["bachelor", "master"];
    case "master":
      return ["master", "phd"];
    case "diploma":
      return ["diploma", "bachelor", "language"];
  }
}

/**
 * Yearly tuition ceiling in BDT for the hard filter.
 * `over_25l` has no ceiling. Living costs are not in this cut — this is
 * not admission-chance scoring.
 */
export function budgetCeilingBdt(band: BudgetBand): number | null {
  switch (band) {
    case "under_8l":
      return 800_000;
    case "8_15l":
      return 1_500_000;
    case "15_25l":
      return 2_500_000;
    case "over_25l":
      return null;
  }
}

export function capShortlist<T>(rows: readonly T[]): T[] {
  return rows.slice(0, MATCH_SHORTLIST_CAP);
}
