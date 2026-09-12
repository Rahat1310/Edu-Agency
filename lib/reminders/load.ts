import "server-only";

import { and, eq, gte, inArray, lte } from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  intakeDeadlines,
  leads,
  programCountries,
  remindersSent,
  users,
  type ProgramCountry,
} from "@/db/schema";
import type {
  ReminderCandidate,
  ReminderDeadline,
} from "@/lib/reminders/match";
import { reminderKey } from "@/lib/reminders/match";

const PROGRAM_COUNTRY_SET = new Set<string>(programCountries);

function isProgramCountry(value: string): value is ProgramCountry {
  return PROGRAM_COUNTRY_SET.has(value);
}

function trimToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function loadReminderBatch(
  todayYmd: string,
  latestYmd: string,
): Promise<{
  candidates: ReminderCandidate[];
  deadlines: ReminderDeadline[];
}> {
  const [applicationRows, deadlineRows] = await Promise.all([
    db
      .select({
        applicationId: applications.id,
        destination: leads.destinationInterest,
        studentName: leads.name,
        phone: leads.phone,
        leadEmail: leads.email,
        userEmail: users.email,
      })
      .from(applications)
      .innerJoin(leads, eq(leads.id, applications.leadId))
      .innerJoin(users, eq(users.id, applications.userId))
      .where(
        and(
          eq(users.isActive, true),
          inArray(leads.destinationInterest, programCountries),
        ),
      ),
    db
      .select({
        deadlineId: intakeDeadlines.id,
        destination: intakeDeadlines.destination,
        intakeLabel: intakeDeadlines.intakeLabel,
        applicationDeadline: intakeDeadlines.applicationDeadline,
      })
      .from(intakeDeadlines)
      .where(
        and(
          gte(intakeDeadlines.applicationDeadline, todayYmd),
          lte(intakeDeadlines.applicationDeadline, latestYmd),
        ),
      ),
  ]);

  const candidates: ReminderCandidate[] = [];

  for (const row of applicationRows) {
    if (!isProgramCountry(row.destination)) {
      continue;
    }

    candidates.push({
      applicationId: row.applicationId,
      destination: row.destination,
      studentName: row.studentName,
      email: trimToNull(row.userEmail) ?? trimToNull(row.leadEmail),
      phone: row.phone,
    });
  }

  return { candidates, deadlines: deadlineRows };
}

export async function loadSentReminderKeys(
  due: readonly { applicationId: string; deadlineId: string; window: number }[],
): Promise<Set<string>> {
  const applicationIds = [...new Set(due.map((item) => item.applicationId))];

  if (applicationIds.length === 0) {
    return new Set();
  }

  const rows = await db
    .select({
      applicationId: remindersSent.applicationId,
      deadlineId: remindersSent.deadlineId,
      window: remindersSent.window,
    })
    .from(remindersSent)
    .where(inArray(remindersSent.applicationId, applicationIds));

  return new Set(rows.map((row) => reminderKey(row)));
}

export async function recordReminderSent(input: {
  applicationId: string;
  deadlineId: string;
  window: number;
}): Promise<void> {
  await db
    .insert(remindersSent)
    .values({
      applicationId: input.applicationId,
      deadlineId: input.deadlineId,
      window: input.window,
    })
    .onConflictDoNothing({
      target: [
        remindersSent.applicationId,
        remindersSent.deadlineId,
        remindersSent.window,
      ],
    });
}
