import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_INTAKE_REMINDER_WINDOWS,
  maxReminderWindow,
  parseReminderWindows,
  shouldSendSms,
} from "@/lib/reminders/windows";

test("empty env falls back to 14, 7, and 2", () => {
  assert.deepEqual(parseReminderWindows(undefined), [
    ...DEFAULT_INTAKE_REMINDER_WINDOWS,
  ]);
  assert.deepEqual(parseReminderWindows("  "), [
    ...DEFAULT_INTAKE_REMINDER_WINDOWS,
  ]);
});

test("comma-separated windows stay unique and skip junk", () => {
  assert.deepEqual(parseReminderWindows("14, 7, 2, 7, -1, x"), [14, 7, 2]);
  assert.equal(maxReminderWindow([2, 14, 7]), 14);
});

test("SMS is only within 48 hours", () => {
  assert.equal(shouldSendSms(2), true);
  assert.equal(shouldSendSms(1), true);
  assert.equal(shouldSendSms(0), true);
  assert.equal(shouldSendSms(3), false);
  assert.equal(shouldSendSms(7), false);
});
