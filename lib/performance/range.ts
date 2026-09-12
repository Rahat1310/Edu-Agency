import {
  AGENCY_TIME_ZONE,
  calendarDateInTimeZone,
} from "@/lib/intakes/countdown";
import type { PerformanceRange } from "@/lib/performance/stats";

export type PerformanceWindow = {
  range: PerformanceRange;
  from: Date | null;
  label: string;
};

const RANGE_COPY: Record<PerformanceRange, string> = {
  this_month: "this month",
  last_30_days: "the last 30 days",
  all: "all time",
};

/** Dhaka civil midnight as an instant, matching other desk date windows. */
export function dhakaMidnightUtc(ymd: string): Date {
  return new Date(`${ymd}T00:00:00+06:00`);
}

export function shiftYmd(ymd: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) {
    return ymd;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  const nextYear = utc.getUTCFullYear();
  const nextMonth = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(utc.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function monthStartYmd(ymd: string): string {
  return `${ymd.slice(0, 7)}-01`;
}

export function performanceWindow(
  range: PerformanceRange,
  now = new Date(),
): PerformanceWindow {
  const todayYmd = calendarDateInTimeZone(now, AGENCY_TIME_ZONE);

  if (range === "all") {
    return { range, from: null, label: RANGE_COPY[range] };
  }

  if (range === "this_month") {
    return {
      range,
      from: dhakaMidnightUtc(monthStartYmd(todayYmd)),
      label: RANGE_COPY[range],
    };
  }

  return {
    range,
    from: dhakaMidnightUtc(shiftYmd(todayYmd, -29)),
    label: RANGE_COPY[range],
  };
}
