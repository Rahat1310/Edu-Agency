import type { LeadStatus } from "@/db/schema";
import type { AssignableCounselor } from "@/lib/leads/counselors";
import type { PerformanceRange } from "@/lib/performance/stats";

export type PerformanceVisaStats = {
  approved: number;
  decided: number;
  percent: number | null;
};

export type PerformanceSnapshot = {
  range: PerformanceRange;
  rangeLabel: string;
  combined: boolean;
  counselorId: string | null;
  counselorLabel: string;
  assigned: number;
  converted: number;
  conversionPercent: number | null;
  byStage: Record<LeadStatus, number>;
  visa: PerformanceVisaStats;
  counselors: AssignableCounselor[];
  canSelectCounselor: boolean;
};
