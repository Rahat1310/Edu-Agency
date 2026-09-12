import "server-only";

import { and, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  leads,
  visaApplications,
  type LeadStatus,
} from "@/db/schema";
import type { SessionUser } from "@/lib/auth-helpers";
import {
  getAssignableCounselor,
  listAssignableCounselors,
} from "@/lib/leads/counselors";
import { performanceWindow } from "@/lib/performance/range";
import { parsePerformanceQuery } from "@/lib/performance/query";
import { resolvePerformanceScope } from "@/lib/performance/scope";
import {
  assignedTotal,
  convertedTotal,
  ratioPercent,
  stageCountsFromRows,
} from "@/lib/performance/stats";
import type { PerformanceSnapshot } from "@/lib/performance/types";

function asCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function loadPerformanceSnapshot(
  user: SessionUser,
  rawQuery: Record<string, string | string[] | undefined>,
  now = new Date(),
): Promise<PerformanceSnapshot> {
  const query = parsePerformanceQuery(rawQuery);
  const scope = resolvePerformanceScope({
    role: user.role,
    userId: user.id,
    requestedCounselorId: query.counselor,
  });
  const window = performanceWindow(query.range, now);
  const canSelectCounselor = user.role === "admin";

  const counselors = canSelectCounselor ? await listAssignableCounselors() : [];

  if (
    canSelectCounselor &&
    scope.counselorId &&
    !counselors.some((row) => row.id === scope.counselorId)
  ) {
    const extra = await getAssignableCounselor(scope.counselorId);
    if (extra) {
      counselors.push(extra);
    }
  }

  const [byStage, visa] = await Promise.all([
    loadStageCounts(scope.counselorId, window.from),
    loadVisaStats(scope.counselorId, window.from),
  ]);

  const assigned = assignedTotal(byStage);
  const converted = convertedTotal(byStage);
  const counselorLabel = scope.combined
    ? "Everyone assigned"
    : scope.counselorId === user.id
      ? "You"
      : (counselors.find((row) => row.id === scope.counselorId)?.label ??
        "Unknown counselor");

  return {
    range: query.range,
    rangeLabel: window.label,
    combined: scope.combined,
    counselorId: scope.counselorId,
    counselorLabel,
    assigned,
    converted,
    conversionPercent: ratioPercent(converted, assigned),
    byStage,
    visa,
    counselors,
    canSelectCounselor,
  };
}

async function loadStageCounts(
  counselorId: string | null,
  from: Date | null,
): Promise<Record<LeadStatus, number>> {
  const filters = [isNotNull(leads.assignedCounselorId)];

  if (counselorId) {
    filters.push(eq(leads.assignedCounselorId, counselorId));
  }

  if (from) {
    filters.push(gte(leads.createdAt, from));
  }

  const rows = await db
    .select({
      status: leads.status,
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(leads)
    .where(and(...filters))
    .groupBy(leads.status);

  return stageCountsFromRows(
    rows.map((row) => ({
      status: row.status,
      total: asCount(row.total),
    })),
  );
}

async function loadVisaStats(
  counselorId: string | null,
  from: Date | null,
): Promise<PerformanceSnapshot["visa"]> {
  const filters = [
    isNotNull(leads.assignedCounselorId),
    inArray(visaApplications.subStatus, ["approved", "rejected"]),
  ];

  if (counselorId) {
    filters.push(eq(leads.assignedCounselorId, counselorId));
  }

  if (from) {
    filters.push(gte(visaApplications.decidedAt, from));
  }

  const [row] = await db
    .select({
      approved: sql<number>`cast(count(*) filter (where ${visaApplications.subStatus} = 'approved') as int)`,
      decided: sql<number>`cast(count(*) as int)`,
    })
    .from(visaApplications)
    .innerJoin(
      applications,
      eq(applications.id, visaApplications.applicationId),
    )
    .innerJoin(leads, eq(leads.id, applications.leadId))
    .where(and(...filters))
    .limit(1);

  const approved = asCount(row?.approved);
  const decided = asCount(row?.decided);

  return {
    approved,
    decided,
    percent: ratioPercent(approved, decided),
  };
}
