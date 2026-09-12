import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import { costEstimates, type ProgramCountry } from "@/db/schema";
import type { EstimateRow } from "@/lib/costs/estimate";

export const COST_ESTIMATES_CACHE_TAG = "cost-estimates";
export const COST_ESTIMATES_REVALIDATE_SECONDS = 3600;

async function queryCostEstimates(
  destination: ProgramCountry,
): Promise<EstimateRow[]> {
  const rows = await db
    .select({
      category: costEstimates.category,
      monthlyAmount: costEstimates.monthlyAmount,
      currency: costEstimates.currency,
    })
    .from(costEstimates)
    .where(eq(costEstimates.destination, destination))
    .orderBy(asc(costEstimates.category));

  return rows;
}

export function getCostEstimates(destination: ProgramCountry) {
  return unstable_cache(
    () => queryCostEstimates(destination),
    ["cost-estimates", destination],
    {
      tags: [COST_ESTIMATES_CACHE_TAG],
      revalidate: COST_ESTIMATES_REVALIDATE_SECONDS,
    },
  )();
}
