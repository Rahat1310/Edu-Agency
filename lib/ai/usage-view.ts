import type { AiProviderId } from "@/lib/ai/types";
import {
  aiProviderDailyCaps,
  aiProviderUsageLabels,
  crossesUsageWarning,
  usagePercent,
  usageProviderOrder,
  type AiProviderDailyCap,
} from "@/lib/ai/usage-caps";

export type UsageDayTotal = {
  day: string;
  provider: AiProviderId;
  calls: number;
  successes: number;
  failures: number;
  tokensIn: number;
  tokensOut: number;
};

export type ProviderUsageSummary = {
  provider: AiProviderId;
  label: string;
  cap: AiProviderDailyCap;
  todayCalls: number;
  todaySuccesses: number;
  todayFailures: number;
  todayTokensIn: number;
  todayTokensOut: number;
  weekCalls: number;
  weekTokensIn: number;
  weekTokensOut: number;
  percentOfCap: number;
  warned: boolean;
};

export function emptyDayTotal(
  day: string,
  provider: AiProviderId,
): UsageDayTotal {
  return {
    day,
    provider,
    calls: 0,
    successes: 0,
    failures: 0,
    tokensIn: 0,
    tokensOut: 0,
  };
}

export function summarizeProviderUsage(
  todayYmd: string,
  days: readonly string[],
  rows: readonly UsageDayTotal[],
): ProviderUsageSummary[] {
  return usageProviderOrder.map((provider) => {
    const cap = aiProviderDailyCaps[provider];
    const forProvider = rows.filter((row) => row.provider === provider);
    const today =
      forProvider.find((row) => row.day === todayYmd) ??
      emptyDayTotal(todayYmd, provider);

    let weekCalls = 0;
    let weekTokensIn = 0;
    let weekTokensOut = 0;
    for (const row of forProvider) {
      if (!days.includes(row.day)) {
        continue;
      }
      weekCalls += row.calls;
      weekTokensIn += row.tokensIn;
      weekTokensOut += row.tokensOut;
    }

    return {
      provider,
      label: aiProviderUsageLabels[provider],
      cap,
      todayCalls: today.calls,
      todaySuccesses: today.successes,
      todayFailures: today.failures,
      todayTokensIn: today.tokensIn,
      todayTokensOut: today.tokensOut,
      weekCalls,
      weekTokensIn,
      weekTokensOut,
      percentOfCap: usagePercent(today.calls, cap.requests),
      warned: crossesUsageWarning(today.calls, cap.requests),
    };
  });
}

export function dailyBreakdown(
  days: readonly string[],
  rows: readonly UsageDayTotal[],
): UsageDayTotal[] {
  const breakdown: UsageDayTotal[] = [];

  for (const day of days) {
    for (const provider of usageProviderOrder) {
      breakdown.push(
        rows.find((row) => row.day === day && row.provider === provider) ??
          emptyDayTotal(day, provider),
      );
    }
  }

  return breakdown;
}
