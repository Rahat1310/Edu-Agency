import { leadStatuses, type LeadStatus } from "@/db/schema";

export const performanceRangeValues = [
  "this_month",
  "last_30_days",
  "all",
] as const;

export type PerformanceRange = (typeof performanceRangeValues)[number];

export const performanceRangeLabels: Record<PerformanceRange, string> = {
  this_month: "This month",
  last_30_days: "Last 30 days",
  all: "All time",
};

/** Pipeline stages that count as converted (applied or further). */
export const convertedLeadStatuses = [
  "applied",
  "offer",
  "visa",
  "departed",
] as const satisfies readonly LeadStatus[];

export type ConvertedLeadStatus = (typeof convertedLeadStatuses)[number];

export function isConvertedLeadStatus(status: LeadStatus): boolean {
  return (convertedLeadStatuses as readonly string[]).includes(status);
}

export const emptyStageCounts: Record<LeadStatus, number> = {
  new: 0,
  contacted: 0,
  documents: 0,
  applied: 0,
  offer: 0,
  visa: 0,
  departed: 0,
};

export function stageCountsFromRows(
  rows: readonly { status: LeadStatus; total: number }[],
): Record<LeadStatus, number> {
  const counts = { ...emptyStageCounts };

  for (const row of rows) {
    if (!(row.status in counts)) {
      continue;
    }
    counts[row.status] = row.total;
  }

  return counts;
}

export function assignedTotal(counts: Record<LeadStatus, number>): number {
  return leadStatuses.reduce((sum, status) => sum + counts[status], 0);
}

export function convertedTotal(counts: Record<LeadStatus, number>): number {
  return convertedLeadStatuses.reduce((sum, status) => sum + counts[status], 0);
}

export function ratioPercent(
  numerator: number,
  denominator: number,
): number | null {
  if (denominator <= 0) {
    return null;
  }

  return Math.round((numerator / denominator) * 100);
}
