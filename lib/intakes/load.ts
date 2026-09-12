import { asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import { intakeDeadlines } from "@/db/schema";
import { DESTINATION_SLUGS, type DestinationSlug } from "@/lib/destinations";
import {
  INTAKE_DEADLINES_CACHE_TAG,
  INTAKE_DEADLINES_REVALIDATE_SECONDS,
} from "@/lib/intakes/constants";
import {
  calendarDateInTimeZone,
  countryFromSlug,
  pickNearestUpcoming,
  toUpcomingCountdown,
  type IntakeDeadlinePick,
  type UpcomingIntakeCountdown,
} from "@/lib/intakes/countdown";

async function queryIntakeDeadlines(): Promise<IntakeDeadlinePick[]> {
  return db
    .select({
      destination: intakeDeadlines.destination,
      intakeLabel: intakeDeadlines.intakeLabel,
      applicationDeadline: intakeDeadlines.applicationDeadline,
    })
    .from(intakeDeadlines)
    .orderBy(asc(intakeDeadlines.applicationDeadline));
}

/**
 * Cached row list only — never cache the "N days" string. Days remaining
 * are computed from Dhaka's calendar date at render / ISR time.
 */
export function listIntakeDeadlines() {
  return unstable_cache(queryIntakeDeadlines, ["intake-deadlines-all"], {
    tags: [INTAKE_DEADLINES_CACHE_TAG],
    revalidate: INTAKE_DEADLINES_REVALIDATE_SECONDS,
  })();
}

function upcomingFromRows(
  rows: readonly IntakeDeadlinePick[],
  slug: DestinationSlug,
  todayYmd: string,
): UpcomingIntakeCountdown | null {
  const nearest = pickNearestUpcoming(rows, countryFromSlug(slug), todayYmd);

  if (!nearest) {
    return null;
  }

  return toUpcomingCountdown(nearest, todayYmd);
}

export async function loadUpcomingCountdownsBySlug(
  now = new Date(),
): Promise<Partial<Record<DestinationSlug, UpcomingIntakeCountdown>>> {
  try {
    const rows = await listIntakeDeadlines();
    const todayYmd = calendarDateInTimeZone(now);
    const result: Partial<Record<DestinationSlug, UpcomingIntakeCountdown>> =
      {};

    for (const slug of DESTINATION_SLUGS) {
      const countdown = upcomingFromRows(rows, slug, todayYmd);
      if (countdown) {
        result[slug] = countdown;
      }
    }

    return result;
  } catch {
    return {};
  }
}

export async function loadUpcomingCountdownForSlug(
  slug: DestinationSlug,
  now = new Date(),
): Promise<UpcomingIntakeCountdown | null> {
  const bySlug = await loadUpcomingCountdownsBySlug(now);
  return bySlug[slug] ?? null;
}
