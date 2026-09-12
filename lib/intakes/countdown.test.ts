import assert from "node:assert/strict";
import { test } from "node:test";

import type { IntakeDeadlinePick } from "@/lib/intakes/countdown";
import {
  calendarDateInTimeZone,
  countryFromSlug,
  daysUntilYmd,
  formatIntakeCountdown,
  pickNearestUpcoming,
  toUpcomingCountdown,
} from "@/lib/intakes/countdown";

const templates = {
  closesInDays: "{destination} {intake} closes in {n} days",
  closesTomorrow: "{destination} {intake} closes tomorrow",
  closesToday: "{destination} {intake} closes today",
};

const rows: IntakeDeadlinePick[] = [
  {
    destination: "china",
    intakeLabel: "Fall 2026",
    applicationDeadline: "2026-05-01",
  },
  {
    destination: "china",
    intakeLabel: "Spring 2027",
    applicationDeadline: "2026-12-15",
  },
  {
    destination: "china",
    intakeLabel: "Fall 2027",
    applicationDeadline: "2027-05-15",
  },
  {
    destination: "india",
    intakeLabel: "Spring 2027",
    applicationDeadline: "2026-11-30",
  },
];

test("a past deadline is never picked, even when it is the only past row", () => {
  const nearest = pickNearestUpcoming(rows, "china", "2026-08-16");

  assert.equal(nearest?.intakeLabel, "Spring 2027");
  assert.equal(nearest?.applicationDeadline, "2026-12-15");
});

test("today's deadline still counts as upcoming with 0 days remaining", () => {
  const nearest = pickNearestUpcoming(rows, "china", "2026-12-15");

  assert.ok(nearest);
  assert.equal(nearest.intakeLabel, "Spring 2027");
  assert.equal(toUpcomingCountdown(nearest, "2026-12-15")?.daysRemaining, 0);
});

test("the day after a deadline advances to the next future intake", () => {
  const nearest = pickNearestUpcoming(rows, "china", "2026-12-16");

  assert.ok(nearest);
  assert.equal(nearest.intakeLabel, "Fall 2027");
  assert.equal(
    toUpcomingCountdown(nearest, "2026-12-16")?.daysRemaining,
    daysUntilYmd("2026-12-16", "2027-05-15"),
  );
});

test("all-past destination returns null so the UI can hide", () => {
  const onlyPast: IntakeDeadlinePick[] = [
    {
      destination: "malaysia",
      intakeLabel: "September 2026",
      applicationDeadline: "2026-04-30",
    },
  ];

  assert.equal(pickNearestUpcoming(onlyPast, "malaysia", "2026-08-16"), null);
});

test("rows for other destinations are ignored", () => {
  const nearest = pickNearestUpcoming(rows, "india", "2026-08-16");

  assert.equal(nearest?.destination, "india");
  assert.equal(nearest?.intakeLabel, "Spring 2027");
});

test("empty list returns null", () => {
  assert.equal(pickNearestUpcoming([], "china", "2026-08-16"), null);
});

test("toUpcomingCountdown returns null for a date that has already passed", () => {
  assert.equal(
    toUpcomingCountdown(
      {
        destination: "china",
        intakeLabel: "Fall 2026",
        applicationDeadline: "2026-05-01",
      },
      "2026-08-16",
    ),
    null,
  );
});

test("days until a known pair is the calendar difference, not wall-clock", () => {
  assert.equal(daysUntilYmd("2026-08-16", "2026-09-19"), 34);
  assert.equal(daysUntilYmd("2026-08-16", "2026-08-16"), 0);
  assert.equal(daysUntilYmd("2026-08-16", "2026-08-15"), -1);
});

test("Dhaka calendar date is used, not UTC", () => {
  const stillSixteenthUtc = new Date("2026-08-16T20:00:00.000Z");

  assert.equal(calendarDateInTimeZone(stillSixteenthUtc, "UTC"), "2026-08-16");
  assert.equal(
    calendarDateInTimeZone(stillSixteenthUtc, "Asia/Dhaka"),
    "2026-08-17",
  );
});

test("south-korea slug maps to the south_korea country enum", () => {
  assert.equal(countryFromSlug("south-korea"), "south_korea");
  assert.equal(countryFromSlug("china"), "china");
});

test("copy interpolates destination, intake, and remaining days", () => {
  assert.equal(
    formatIntakeCountdown(templates, {
      destination: "China",
      intake: "Spring 2027",
      daysRemaining: 34,
    }),
    "China Spring 2027 closes in 34 days",
  );
  assert.equal(
    formatIntakeCountdown(templates, {
      destination: "China",
      intake: "Spring 2027",
      daysRemaining: 1,
    }),
    "China Spring 2027 closes tomorrow",
  );
  assert.equal(
    formatIntakeCountdown(templates, {
      destination: "China",
      intake: "Spring 2027",
      daysRemaining: 0,
    }),
    "China Spring 2027 closes today",
  );
});
