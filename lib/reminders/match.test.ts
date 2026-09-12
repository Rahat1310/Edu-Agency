import assert from "node:assert/strict";
import { test } from "node:test";

import type {
  ReminderCandidate,
  ReminderDeadline,
} from "@/lib/reminders/match";
import { matchDueReminders } from "@/lib/reminders/match";
import { shouldSendSms } from "@/lib/reminders/windows";

function candidate(
  id: string,
  destination: ReminderCandidate["destination"],
): ReminderCandidate {
  return {
    applicationId: id,
    destination,
    studentName: "Ayesha",
    email: "ayesha@example.com",
    phone: "01700000000",
  };
}

const deadlines: ReminderDeadline[] = [
  {
    deadlineId: "d-china-fall",
    destination: "china",
    intakeLabel: "Fall 2026",
    applicationDeadline: "2026-09-01",
  },
  {
    deadlineId: "d-china-spring",
    destination: "china",
    intakeLabel: "Spring 2027",
    applicationDeadline: "2026-09-08",
  },
  {
    deadlineId: "d-india",
    destination: "india",
    intakeLabel: "January 2027",
    applicationDeadline: "2026-08-30",
  },
];

const windows = [14, 7, 2];

test("14, 7, and 2 day windows fire on the exact Dhaka calendar day", () => {
  const fourteen = matchDueReminders(
    [candidate("a-14", "china")],
    deadlines,
    windows,
    "2026-08-18",
  );
  assert.equal(fourteen.length, 1);
  assert.equal(fourteen[0]?.window, 14);
  assert.equal(fourteen[0]?.deadlineId, "d-china-fall");
  assert.equal(shouldSendSms(fourteen[0]?.daysRemaining ?? -1), false);

  const seven = matchDueReminders(
    [candidate("a-7", "china")],
    deadlines,
    windows,
    "2026-08-25",
  );
  assert.equal(seven[0]?.window, 7);
  assert.equal(seven[0]?.deadlineId, "d-china-fall");

  const two = matchDueReminders(
    [candidate("a-2", "china")],
    deadlines,
    windows,
    "2026-08-30",
  );
  assert.equal(two[0]?.window, 2);
  assert.equal(shouldSendSms(two[0]?.daysRemaining ?? -1), true);
});

test("days between windows do not send", () => {
  const due = matchDueReminders(
    [candidate("a-10", "china")],
    deadlines,
    windows,
    "2026-08-22",
  );
  assert.equal(due.length, 0);
});

test("only the nearest upcoming deadline is considered — late sign-up does not backfill", () => {
  const due = matchDueReminders(
    [candidate("a-late", "china")],
    deadlines,
    windows,
    "2026-08-25",
  );

  assert.equal(due.length, 1);
  assert.equal(due[0]?.window, 7);
  assert.equal(due[0]?.deadlineId, "d-china-fall");
  assert.equal(
    due.some((item) => item.deadlineId === "d-china-spring"),
    false,
  );
});

test("destination is cross-referenced — an India deadline does not remind a China student", () => {
  const due = matchDueReminders(
    [candidate("a-china", "china")],
    deadlines,
    windows,
    "2026-08-16",
  );
  assert.equal(due.length, 0);
});

test("India 14-day window uses the India deadline", () => {
  const due = matchDueReminders(
    [candidate("a-india", "india")],
    deadlines,
    windows,
    "2026-08-16",
  );
  assert.equal(due.length, 1);
  assert.equal(due[0]?.deadlineId, "d-india");
  assert.equal(due[0]?.window, 14);
});

test("a past nearest deadline is ignored even if a later intake sits in a window", () => {
  const onlyPastThenFar: ReminderDeadline[] = [
    {
      deadlineId: "past",
      destination: "malaysia",
      intakeLabel: "Past",
      applicationDeadline: "2026-08-01",
    },
    {
      deadlineId: "far",
      destination: "malaysia",
      intakeLabel: "Later",
      applicationDeadline: "2026-09-01",
    },
  ];

  const due = matchDueReminders(
    [candidate("a-my", "malaysia")],
    onlyPastThenFar,
    windows,
    "2026-08-18",
  );

  assert.equal(due.length, 1);
  assert.equal(due[0]?.deadlineId, "far");
  assert.equal(due[0]?.window, 14);
});
