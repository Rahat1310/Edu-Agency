import assert from "node:assert/strict";
import { test } from "node:test";

import type { NurtureCandidate } from "@/lib/nurture/match";
import {
  daysSinceContact,
  isNurtureEligibleStatus,
  matchDueNurture,
  matchNurtureStep,
} from "@/lib/nurture/match";
import { nurtureSequence } from "@/lib/nurture/sequence";

function candidate(
  overrides: Partial<NurtureCandidate> = {},
): NurtureCandidate {
  return {
    leadId: "lead-1",
    name: "Ayesha",
    email: "ayesha@example.com",
    phone: "01700000000",
    whatsapp: null,
    destinationInterest: "china",
    status: "new",
    lastContactAt: new Date("2026-08-12T06:00:00+06:00"),
    lastInboundAt: null,
    sentStepIds: [],
    ...overrides,
  };
}

const noon = (ymd: string) => new Date(`${ymd}T12:00:00+06:00`);

test("eligible statuses are only new and contacted", () => {
  assert.equal(isNurtureEligibleStatus("new"), true);
  assert.equal(isNurtureEligibleStatus("contacted"), true);
  assert.equal(isNurtureEligibleStatus("documents"), false);
  assert.equal(isNurtureEligibleStatus("applied"), false);
});

test("days since contact uses Dhaka calendar dates", () => {
  assert.equal(
    daysSinceContact(
      new Date("2026-08-12T23:00:00+06:00"),
      new Date("2026-08-17T01:00:00+06:00"),
    ),
    5,
  );
});

test("a stale lead receives the matching days-since-contact bucket", () => {
  const five = matchNurtureStep(
    candidate(),
    nurtureSequence,
    noon("2026-08-17"),
  );
  assert.equal(five?.id, "idle-5");

  const ten = matchNurtureStep(
    candidate({ lastContactAt: new Date("2026-08-07T06:00:00+06:00") }),
    nurtureSequence,
    noon("2026-08-17"),
  );
  assert.equal(ten?.id, "idle-10");

  const twenty = matchNurtureStep(
    candidate({ lastContactAt: new Date("2026-07-28T06:00:00+06:00") }),
    nurtureSequence,
    noon("2026-08-17"),
  );
  assert.equal(twenty?.id, "idle-20");
});

test("does not backfill an older unsent step once a later bucket is reached", () => {
  const due = matchDueNurture(
    [
      candidate({
        lastContactAt: new Date("2026-08-07T06:00:00+06:00"),
        sentStepIds: [],
      }),
    ],
    nurtureSequence,
    noon("2026-08-17"),
  );

  assert.equal(due.length, 1);
  assert.equal(due[0]?.step.id, "idle-10");
});

test("already-sent current bucket does not backfill an older step", () => {
  const step = matchNurtureStep(
    candidate({
      lastContactAt: new Date("2026-08-07T06:00:00+06:00"),
      sentStepIds: ["idle-10"],
    }),
    nurtureSequence,
    noon("2026-08-17"),
  );

  assert.equal(step, null);
});

test("a lead that responded is not matched", () => {
  const step = matchNurtureStep(
    candidate({ lastInboundAt: new Date("2026-08-16T12:00:00+06:00") }),
    nurtureSequence,
    noon("2026-08-17"),
  );
  assert.equal(step, null);
});

test("a lead past contacted is not matched", () => {
  const step = matchNurtureStep(
    candidate({ status: "documents" }),
    nurtureSequence,
    noon("2026-08-17"),
  );
  assert.equal(step, null);
});

test("four days idle is below the first bucket", () => {
  const step = matchNurtureStep(
    candidate({ lastContactAt: new Date("2026-08-13T06:00:00+06:00") }),
    nurtureSequence,
    noon("2026-08-17"),
  );
  assert.equal(step, null);
});
