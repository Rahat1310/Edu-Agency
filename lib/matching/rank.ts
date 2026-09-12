import type { FaqCache } from "@/lib/ai/faq-cache";
import type {
  AiMessage,
  ChatCompletionOptions,
  ChatCompletionResult,
} from "@/lib/ai/types";
import { capShortlist } from "@/lib/matching/filters";
import {
  MATCH_CACHE_TTL_SECONDS,
  MATCH_TOP_N,
  matchCacheKey,
  profileHash,
  type StudentMatchProfile,
} from "@/lib/matching/profile";
import {
  matchingSystemPrompt,
  matchingUserPrompt,
  parseRankedIds,
} from "@/lib/matching/prompt";
import type {
  MatchingShortlistProgram,
  RankedMatch,
} from "@/lib/matching/types";

export type MatchingCompleteFn = (
  task: "matching",
  messages: readonly AiMessage[],
  options?: ChatCompletionOptions,
) => Promise<ChatCompletionResult>;

export type LoadMatchingShortlistFn = (
  profile: StudentMatchProfile,
) => Promise<MatchingShortlistProgram[]>;

export type ProgramMatchResult = {
  matches: RankedMatch[];
  shortlistCount: number;
  cached: boolean;
  profileHash: string;
  emptyShortlist: boolean;
};

type CachedPayload = {
  matches: RankedMatch[];
  shortlistCount: number;
  profileHash: string;
};

export async function rankProgramMatches(
  input: {
    profile: StudentMatchProfile;
    refresh?: boolean;
  },
  deps: {
    complete: MatchingCompleteFn;
    cache: FaqCache;
    loadShortlist: LoadMatchingShortlistFn;
  },
): Promise<ProgramMatchResult> {
  const key = matchCacheKey(input.profile);
  const hash = profileHash(input.profile);

  if (!input.refresh) {
    const hit = await deps.cache.get(key);
    const cached = parseCachedPayload(hit);
    if (cached) {
      return { ...cached, cached: true, emptyShortlist: false };
    }
  }

  const shortlist = capShortlist(await deps.loadShortlist(input.profile));

  if (shortlist.length === 0) {
    return {
      matches: [],
      shortlistCount: 0,
      cached: false,
      profileHash: hash,
      emptyShortlist: true,
    };
  }

  const messages: AiMessage[] = [
    { role: "system", content: matchingSystemPrompt() },
    { role: "user", content: matchingUserPrompt(input.profile, shortlist) },
  ];

  const completion = await deps.complete("matching", messages, {
    temperature: 0.2,
    maxTokens: 900,
  });

  const allowed = new Set(shortlist.map((program) => program.id));
  const ranked = parseRankedIds(completion.text, allowed);
  const byId = new Map(shortlist.map((program) => [program.id, program]));
  const matches = attachPrograms(ranked, byId);

  const filled =
    matches.length > 0
      ? matches
      : fallbackMatches(shortlist.slice(0, MATCH_TOP_N));

  const payload: CachedPayload = {
    matches: filled,
    shortlistCount: shortlist.length,
    profileHash: hash,
  };

  await deps.cache.set(key, JSON.stringify(payload), MATCH_CACHE_TTL_SECONDS);

  return {
    ...payload,
    cached: false,
    emptyShortlist: false,
  };
}

function attachPrograms(
  ranked: { id: string; reason: string }[],
  byId: Map<string, MatchingShortlistProgram>,
): RankedMatch[] {
  const matches: RankedMatch[] = [];

  for (const entry of ranked) {
    const program = byId.get(entry.id);
    if (!program) {
      continue;
    }

    matches.push({
      ...program,
      rank: matches.length + 1,
      reason: entry.reason,
    });
  }

  return matches;
}

function fallbackMatches(programs: MatchingShortlistProgram[]): RankedMatch[] {
  return programs.map((program, index) => ({
    ...program,
    rank: index + 1,
    reason:
      "This program passed the destination, level, and budget filters on your file. A counselor can say whether the university paperwork fits.",
  }));
}

function asRankedMatch(value: unknown): RankedMatch | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.universityName !== "string" ||
    typeof row.country !== "string" ||
    typeof row.level !== "string" ||
    typeof row.field !== "string" ||
    typeof row.tuitionAmount !== "string" ||
    typeof row.tuitionCurrency !== "string" ||
    typeof row.reason !== "string" ||
    typeof row.rank !== "number"
  ) {
    return null;
  }

  return row as RankedMatch;
}

function parseCachedPayload(raw: string | null): CachedPayload | null {
  if (!raw) {
    return null;
  }

  let data: unknown = raw;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  if (
    !Array.isArray(record.matches) ||
    typeof record.shortlistCount !== "number"
  ) {
    return null;
  }

  const matches: RankedMatch[] = [];
  for (const item of record.matches) {
    const row = asRankedMatch(item);
    if (!row) {
      return null;
    }
    matches.push(row);
  }

  return {
    matches,
    shortlistCount: record.shortlistCount,
    profileHash:
      typeof record.profileHash === "string" ? record.profileHash : "",
  };
}
