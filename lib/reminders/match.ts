import type { ProgramCountry } from "@/db/schema";
import { daysUntilYmd, isUpcomingYmd } from "@/lib/intakes/countdown";

export type ReminderCandidate = {
  applicationId: string;
  destination: ProgramCountry;
  studentName: string;
  email: string | null;
  phone: string;
};

export type ReminderDeadline = {
  deadlineId: string;
  destination: ProgramCountry;
  intakeLabel: string;
  applicationDeadline: string;
};

export type DueReminder = ReminderCandidate & {
  deadlineId: string;
  window: number;
  daysRemaining: number;
  intakeLabel: string;
  applicationDeadline: string;
};

export function reminderKey(input: {
  applicationId: string;
  deadlineId: string;
  window: number;
}): string {
  return `${input.applicationId}:${input.deadlineId}:${input.window}`;
}

function pickNearestDeadline(
  rows: readonly ReminderDeadline[],
  destination: ProgramCountry,
  todayYmd: string,
): ReminderDeadline | null {
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

/**
 * Exact-day windows against the nearest upcoming intake for the student's
 * destination. Late sign-up only fires the current window — never backfills.
 */
export function matchDueReminders(
  candidates: readonly ReminderCandidate[],
  deadlines: readonly ReminderDeadline[],
  windows: readonly number[],
  todayYmd: string,
): DueReminder[] {
  const windowSet = new Set(windows);
  const due: DueReminder[] = [];

  for (const candidate of candidates) {
    const nearest = pickNearestDeadline(
      deadlines,
      candidate.destination,
      todayYmd,
    );

    if (!nearest) {
      continue;
    }

    const daysRemaining = daysUntilYmd(todayYmd, nearest.applicationDeadline);

    if (!windowSet.has(daysRemaining)) {
      continue;
    }

    due.push({
      ...candidate,
      deadlineId: nearest.deadlineId,
      window: daysRemaining,
      daysRemaining,
      intakeLabel: nearest.intakeLabel,
      applicationDeadline: nearest.applicationDeadline,
    });
  }

  return due;
}
