import "server-only";

import { and, asc, eq, inArray, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { programs } from "@/db/schema";
import { toBdt, type BdtRates } from "@/lib/fx/load-rates";
import { getBdtRates } from "@/lib/fx/rates";
import { budgetCeilingBdt, levelsForEducation } from "@/lib/matching/filters";
import {
  MATCH_SHORTLIST_CAP,
  type StudentMatchProfile,
} from "@/lib/matching/profile";
import type { MatchingShortlistProgram } from "@/lib/matching/types";

const shortlistColumns = {
  id: programs.id,
  universityName: programs.universityName,
  country: programs.country,
  level: programs.level,
  field: programs.field,
  tuitionAmount: programs.tuitionAmount,
  tuitionCurrency: programs.tuitionCurrency,
};

function tuitionWithinCeiling(ceilingBdt: number, rates: BdtRates) {
  return or(
    and(
      eq(programs.tuitionCurrency, "CNY"),
      sql`(${programs.tuitionAmount})::numeric * ${toBdt(1, "CNY", rates)} <= ${ceilingBdt}`,
    ),
    and(
      eq(programs.tuitionCurrency, "INR"),
      sql`(${programs.tuitionAmount})::numeric * ${toBdt(1, "INR", rates)} <= ${ceilingBdt}`,
    ),
    and(
      eq(programs.tuitionCurrency, "MYR"),
      sql`(${programs.tuitionAmount})::numeric * ${toBdt(1, "MYR", rates)} <= ${ceilingBdt}`,
    ),
    and(
      eq(programs.tuitionCurrency, "KRW"),
      sql`(${programs.tuitionAmount})::numeric * ${toBdt(1, "KRW", rates)} <= ${ceilingBdt}`,
    ),
  );
}

/**
 * Hard filters only — published programs matching country, level, and
 * tuition-vs-budget. Never returns more than MATCH_SHORTLIST_CAP rows.
 */
export async function loadMatchingShortlist(
  profile: StudentMatchProfile,
  rates?: BdtRates,
): Promise<MatchingShortlistProgram[]> {
  const bdtRates = rates ?? (await getBdtRates());
  const levels = levelsForEducation(profile.educationLevel);
  const ceiling = budgetCeilingBdt(profile.budget);
  const conditions = [
    eq(programs.isPublished, true),
    inArray(programs.country, profile.destinations),
    inArray(programs.level, [...levels]),
  ];

  if (ceiling != null) {
    const budgetWhere = tuitionWithinCeiling(ceiling, bdtRates);
    if (budgetWhere) {
      conditions.push(budgetWhere);
    }
  }

  const rows = await db
    .select(shortlistColumns)
    .from(programs)
    .where(and(...conditions))
    .orderBy(asc(programs.universityName), asc(programs.field))
    .limit(MATCH_SHORTLIST_CAP);

  return rows;
}
