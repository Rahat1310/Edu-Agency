import { z } from "zod";

import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";

export const COMPARE_PROGRAM_LIMIT = 3;
export const COMPARE_IDS_PARAM = "ids";

const uuidSchema = z.string().uuid();

/**
 * Parse `?ids=a,b,c` the same way directory filters parse the URL:
 * invalid tokens drop out, order is kept, and extras past the cap are ignored.
 */
export function parseCompareIds(
  raw: string | string[] | readonly string[] | undefined,
): string[] {
  const joined =
    raw == null ? "" : typeof raw === "string" ? raw : raw.join(",");
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const part of joined.split(/[,\s]+/)) {
    const id = part.trim();
    if (!id || seen.has(id) || !uuidSchema.safeParse(id).success) {
      continue;
    }
    seen.add(id);
    ids.push(id);
    if (ids.length >= COMPARE_PROGRAM_LIMIT) {
      break;
    }
  }

  return ids;
}

export function serializeCompareIds(ids: readonly string[]): string {
  return parseCompareIds(ids).join(",");
}

export function toggleCompareId(
  current: readonly string[],
  id: string,
): { ids: string[]; blocked: boolean } {
  const ids = parseCompareIds(current);

  if (ids.includes(id)) {
    return { ids: ids.filter((item) => item !== id), blocked: false };
  }

  if (ids.length >= COMPARE_PROGRAM_LIMIT) {
    return { ids, blocked: true };
  }

  if (!uuidSchema.safeParse(id).success) {
    return { ids, blocked: false };
  }

  return { ids: [...ids, id], blocked: false };
}

export function compareProgramsHref(
  locale: Locale,
  ids: readonly string[],
): string {
  const serialized = serializeCompareIds(ids);
  const path = localizedHref("/programs/compare", locale);
  return serialized ? `${path}?${COMPARE_IDS_PARAM}=${serialized}` : path;
}
