import type { ProgramCountry } from "@/db/schema";
import type { DestinationSlug } from "@/lib/destinations";

/** Agency desk is in Dhaka — countdown calendar days follow this zone. */
export const AGENCY_TIME_ZONE = "Asia/Dhaka";

export type IntakeDeadlinePick = {
  destination: ProgramCountry;
  intakeLabel: string;
  applicationDeadline: string;
};

export type UpcomingIntakeCountdown = IntakeDeadlinePick & {
  daysRemaining: number;
};

const SLUG_TO_COUNTRY: Record<DestinationSlug, ProgramCountry> = {
  china: "china",
  india: "india",
  malaysia: "malaysia",
  "south-korea": "south_korea",
};

export function countryFromSlug(slug: DestinationSlug): ProgramCountry {
  return SLUG_TO_COUNTRY[slug];
}

/**
 * `en-CA` yields `YYYY-MM-DD`, matching the `date` column string mode.
 */
export function calendarDateInTimeZone(
  now: Date,
  timeZone = AGENCY_TIME_ZONE,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function parseYmd(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);

  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return null;
  }

  const utc = new Date(Date.UTC(y, m - 1, d));
  if (
    utc.getUTCFullYear() !== y ||
    utc.getUTCMonth() !== m - 1 ||
    utc.getUTCDate() !== d
  ) {
    return null;
  }

  return { y, m, d };
}

export function isValidYmd(value: string): boolean {
  return parseYmd(value) !== null;
}

/** Inclusive of today: the deadline day itself still counts as upcoming. */
export function isUpcomingYmd(todayYmd: string, deadlineYmd: string): boolean {
  return deadlineYmd >= todayYmd;
}

export function daysUntilYmd(todayYmd: string, deadlineYmd: string): number {
  const today = parseYmd(todayYmd);
  const deadline = parseYmd(deadlineYmd);

  if (!today || !deadline) {
    return Number.NEGATIVE_INFINITY;
  }

  const todayUtc = Date.UTC(today.y, today.m - 1, today.d);
  const deadlineUtc = Date.UTC(deadline.y, deadline.m - 1, deadline.d);

  return Math.round((deadlineUtc - todayUtc) / 86_400_000);
}

export function pickNearestUpcoming(
  rows: readonly IntakeDeadlinePick[],
  destination: ProgramCountry,
  todayYmd: string,
): IntakeDeadlinePick | null {
  const upcoming = rows.filter(
    (row) =>
      row.destination === destination &&
      isUpcomingYmd(todayYmd, row.applicationDeadline),
  );

  if (upcoming.length === 0) {
    return null;
  }

  const sorted = [...upcoming].sort((a, b) =>
    a.applicationDeadline.localeCompare(b.applicationDeadline),
  );

  return sorted[0] ?? null;
}

export function toUpcomingCountdown(
  row: IntakeDeadlinePick,
  todayYmd: string,
): UpcomingIntakeCountdown | null {
  const daysRemaining = daysUntilYmd(todayYmd, row.applicationDeadline);

  if (daysRemaining < 0) {
    return null;
  }

  return { ...row, daysRemaining };
}

export function formatIntakeCountdown(
  templates: {
    closesInDays: string;
    closesTomorrow: string;
    closesToday: string;
  },
  input: {
    destination: string;
    intake: string;
    daysRemaining: number;
  },
): string {
  const template =
    input.daysRemaining <= 0
      ? templates.closesToday
      : input.daysRemaining === 1
        ? templates.closesTomorrow
        : templates.closesInDays;

  return template
    .replace("{destination}", input.destination)
    .replace("{intake}", input.intake)
    .replace("{n}", String(input.daysRemaining));
}
