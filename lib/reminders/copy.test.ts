import assert from "node:assert/strict";
import { test } from "node:test";

import { intakeReminderEmail, intakeReminderSms } from "@/lib/reminders/copy";

const input = {
  studentName: "Ayesha",
  destination: "south_korea" as const,
  intakeLabel: "Fall 2026",
  applicationDeadline: "2026-09-01",
  daysRemaining: 14,
};

test("email copy names the deadline and never invents an admission chance", () => {
  const email = intakeReminderEmail(input);

  assert.match(email.subject, /South Korea/);
  assert.match(email.subject, /Fall 2026/);
  assert.match(email.text, /Ayesha/);
  assert.match(email.text, /1 September 2026/);
  assert.match(email.text, /\/portal/);
  assert.equal(/chance|likely|admit/i.test(email.text), false);
  assert.match(email.text, /not an admission decision/i);
});

test("SMS stays short and names the same deadline", () => {
  const sms = intakeReminderSms({ ...input, daysRemaining: 2 });

  assert.match(sms, /Study Abroad Consultancy/);
  assert.match(sms, /South Korea/);
  assert.match(sms, /in 2 days/);
  assert.equal(/chance|likely|admit/i.test(sms), false);
});
