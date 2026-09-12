import type { StudentMatchProfile } from "@/lib/matching/profile";
import { MATCH_TOP_N } from "@/lib/matching/profile";
import type { MatchingShortlistProgram } from "@/lib/matching/types";

export type {
  MatchingShortlistProgram,
  RankedMatch,
} from "@/lib/matching/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function matchingSystemPrompt(): string {
  return `You rank published study programs for a Bangladeshi student using ONLY the shortlist in the user message.

Rules:
- Return JSON only, no markdown.
- Rank at most ${MATCH_TOP_N} programs. Fewer is fine if the shortlist is smaller.
- Use each program's id exactly as given. Never invent a program, university, id, tuition, or scholarship.
- Do not estimate admission chance, visa success, or scholarship probability. Those criteria are not in this directory yet.
- For each pick, write 1–2 short sentences on why it fits this student's destination, level, budget band, and any test scores provided.
- If a test score is missing, do not assume a score.

JSON shape:
{"matches":[{"id":"<uuid>","reason":"<1-2 sentences>"}]}
`;
}

export function matchingUserPrompt(
  profile: StudentMatchProfile,
  shortlist: readonly MatchingShortlistProgram[],
): string {
  return `PROFILE
${JSON.stringify({
  educationLevel: profile.educationLevel,
  destinations: profile.destinations,
  ielts: profile.ielts ?? null,
  toefl: profile.toefl ?? null,
  hsk: profile.hsk ?? null,
  topik: profile.topik ?? null,
  budget: profile.budget,
})}

SHORTLIST
${JSON.stringify(
  shortlist.map((program) => ({
    id: program.id,
    universityName: program.universityName,
    country: program.country,
    level: program.level,
    field: program.field,
    tuitionAmount: program.tuitionAmount,
    tuitionCurrency: program.tuitionCurrency,
  })),
)}`;
}

export function parseShortlistFromUserPrompt(content: string): string[] {
  const marker = "SHORTLIST\n";
  const index = content.indexOf(marker);
  if (index < 0) {
    return [];
  }

  const raw = content.slice(index + marker.length).trim();

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const ids: string[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const id = (item as { id?: unknown }).id;
      if (typeof id === "string" && UUID_RE.test(id) && !ids.includes(id)) {
        ids.push(id);
      }
    }

    return ids;
  } catch {
    return [];
  }
}

export function parseRankedIds(
  raw: string,
  allowedIds: ReadonlySet<string>,
): { id: string; reason: string }[] {
  const jsonText = extractJsonObject(raw);
  if (!jsonText) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText) as unknown;
  } catch {
    return [];
  }

  if (!parsed || typeof parsed !== "object") {
    return [];
  }

  const matches = (parsed as { matches?: unknown }).matches;
  if (!Array.isArray(matches)) {
    return [];
  }

  const ranked: { id: string; reason: string }[] = [];

  for (const item of matches) {
    if (ranked.length >= MATCH_TOP_N) {
      break;
    }

    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as { id?: unknown; reason?: unknown };
    if (typeof record.id !== "string" || !allowedIds.has(record.id)) {
      continue;
    }

    if (ranked.some((entry) => entry.id === record.id)) {
      continue;
    }

    const reason =
      typeof record.reason === "string" ? record.reason.trim() : "";
    if (reason.length === 0) {
      continue;
    }

    ranked.push({
      id: record.id,
      reason: reason.slice(0, 600),
    });
  }

  return ranked;
}

function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }

  return trimmed.slice(start, end + 1);
}
