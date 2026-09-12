import { aiProviders, type AiProviderId } from "@/lib/ai/types";

/** Flag the desk when today's calls reach this share of the daily request cap. */
export const AI_USAGE_WARNING_RATIO = 0.8;

export const AI_USAGE_CAPS_AS_OF = "mid-2026";

export const AI_USAGE_WINDOW_DAYS = 7;

export type AiProviderDailyCap = {
  requests: number;
  tokensPerMinute?: number;
  altRequests?: number;
  altRequestsLabel?: string;
  notes: string;
};

/**
 * Published free-tier request caps used as reference lines on /admin/ai-usage.
 * Re-check each provider's current docs — these numbers move without much notice.
 */
export const aiProviderDailyCaps: Record<AiProviderId, AiProviderDailyCap> = {
  groq: {
    requests: 14_400,
    tokensPerMinute: 6_000,
    notes: "14,400 requests/day and 6,000 tokens/minute on the free tier.",
  },
  gemini: {
    requests: 1_500,
    notes:
      "About 1,500 requests/day combined for Gemini Flash on the free tier.",
  },
  openrouter: {
    requests: 50,
    altRequests: 1_000,
    altRequestsLabel: "with credits",
    notes:
      "50 requests/day without credits, 1,000/day once the account has credits.",
  },
};

export const aiProviderUsageLabels: Record<AiProviderId, string> = {
  groq: "Groq",
  gemini: "Gemini Flash",
  openrouter: "OpenRouter",
};

export function usagePercent(calls: number, cap: number): number {
  if (cap <= 0) {
    return 0;
  }

  return Math.min(999, (calls / cap) * 100);
}

export function crossesUsageWarning(calls: number, cap: number): boolean {
  return calls >= cap * AI_USAGE_WARNING_RATIO;
}

export function warningThreshold(cap: number): number {
  return Math.ceil(cap * AI_USAGE_WARNING_RATIO);
}

export function shiftYmd(ymd: string, deltaDays: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) {
    return ymd;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day + deltaDays));
  return utc.toISOString().slice(0, 10);
}

export function usageWindowDays(
  todayYmd: string,
  length = AI_USAGE_WINDOW_DAYS,
): string[] {
  const days: string[] = [];
  for (let offset = length - 1; offset >= 0; offset -= 1) {
    days.push(shiftYmd(todayYmd, -offset));
  }
  return days;
}

export const usageProviderOrder: readonly AiProviderId[] = aiProviders;
