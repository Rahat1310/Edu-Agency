import type { ProgramCountry } from "@/db/schema";
import { calendarDateInTimeZone } from "@/lib/intakes/countdown";

export const FEATURED_STORY_MAX = 4;
export const FEATURED_STORY_MIN = 3;

export type PublicSuccessStory = {
  id: string;
  studentName: string;
  destination: ProgramCountry;
  university: string;
  program: string;
  photoR2Key: string | null;
  quote: string;
  createdAt: Date | null;
};

export type SuccessStoryView = PublicSuccessStory & {
  photoUrl: string | null;
};

const destinationAliases: Record<string, ProgramCountry> = {
  china: "china",
  india: "india",
  malaysia: "malaysia",
  south_korea: "south_korea",
  "south-korea": "south_korea",
};

export function parseStoryDestination(
  value: string | undefined,
): ProgramCountry | "" {
  if (!value) {
    return "";
  }

  return destinationAliases[value] ?? "";
}

export function filterStoriesByDestination(
  stories: readonly PublicSuccessStory[],
  destination: ProgramCountry | "",
): PublicSuccessStory[] {
  if (!destination) {
    return [...stories];
  }

  return stories.filter((story) => story.destination === destination);
}

/** 1–2 stories show as-is; 3+ show three or four cards in the featured set. */
export function featuredWindowSize(total: number): number {
  if (total <= 0) {
    return 0;
  }

  if (total < FEATURED_STORY_MIN) {
    return total;
  }

  return Math.min(FEATURED_STORY_MAX, total);
}

export function rotateStories<T>(
  items: readonly T[],
  offset: number,
  count: number,
): T[] {
  if (items.length === 0 || count <= 0) {
    return [];
  }

  const size = Math.min(count, items.length);
  const start = ((offset % items.length) + items.length) % items.length;
  const result: T[] = [];

  for (let index = 0; index < size; index += 1) {
    const item = items[(start + index) % items.length];
    if (item !== undefined) {
      result.push(item);
    }
  }

  return result;
}

/** Stable daily offset in Dhaka so ISR HTML does not shuffle every request. */
export function dailyRotationOffset(
  now: Date,
  length: number,
  timeZone = "Asia/Dhaka",
): number {
  if (length <= 0) {
    return 0;
  }

  const ymd = calendarDateInTimeZone(now, timeZone);
  let hash = 0;
  for (const char of ymd) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash % length;
}
