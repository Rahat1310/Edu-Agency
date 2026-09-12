import "server-only";

import { gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { aiUsageLog } from "@/db/schema";
import { aiProviders, type AiProviderId } from "@/lib/ai/types";
import { AI_USAGE_WINDOW_DAYS, usageWindowDays } from "@/lib/ai/usage-caps";
import {
  dailyBreakdown,
  summarizeProviderUsage,
  type UsageDayTotal,
} from "@/lib/ai/usage-view";
import {
  AGENCY_TIME_ZONE,
  calendarDateInTimeZone,
} from "@/lib/intakes/countdown";

const providerSet = new Set<string>(aiProviders);

function asProvider(value: string): AiProviderId | null {
  return providerSet.has(value) ? (value as AiProviderId) : null;
}

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

function dhakaMidnightUtc(ymd: string): Date {
  return new Date(`${ymd}T00:00:00+06:00`);
}

export async function loadAiUsageDashboard(now = new Date()) {
  const todayYmd = calendarDateInTimeZone(now, AGENCY_TIME_ZONE);
  const days = usageWindowDays(todayYmd, AI_USAGE_WINDOW_DAYS);
  const fromYmd = days[0];
  if (!fromYmd) {
    return {
      todayYmd,
      days,
      providers: summarizeProviderUsage(todayYmd, days, []),
      daily: [],
    };
  }

  const from = dhakaMidnightUtc(fromYmd);
  const dayExpr = sql`(((${aiUsageLog.createdAt}) AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Dhaka')::date`;
  const rows = await db
    .select({
      day: sql<string>`${dayExpr}::text`,
      provider: aiUsageLog.provider,
      calls: sql<number>`count(*)::int`,
      successes: sql<number>`count(*) filter (where ${aiUsageLog.success})::int`,
      failures: sql<number>`count(*) filter (where not ${aiUsageLog.success})::int`,
      tokensIn: sql<number>`coalesce(sum(${aiUsageLog.tokensIn}), 0)::int`,
      tokensOut: sql<number>`coalesce(sum(${aiUsageLog.tokensOut}), 0)::int`,
    })
    .from(aiUsageLog)
    .where(gte(aiUsageLog.createdAt, from))
    .groupBy(dayExpr, aiUsageLog.provider);

  const totals: UsageDayTotal[] = [];
  for (const row of rows) {
    const provider = asProvider(row.provider);
    if (!provider) {
      continue;
    }

    totals.push({
      day: row.day,
      provider,
      calls: asCount(row.calls),
      successes: asCount(row.successes),
      failures: asCount(row.failures),
      tokensIn: asCount(row.tokensIn),
      tokensOut: asCount(row.tokensOut),
    });
  }

  return {
    todayYmd,
    days,
    providers: summarizeProviderUsage(todayYmd, days, totals),
    daily: dailyBreakdown(days, totals),
  };
}
