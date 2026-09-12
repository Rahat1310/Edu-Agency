import assert from "node:assert/strict";
import { test } from "node:test";

import { sendAndRecord } from "@/lib/reminders/dispatch";
import type { DueReminder } from "@/lib/reminders/match";
import { reminderKey } from "@/lib/reminders/match";

function due(overrides: Partial<DueReminder> = {}): DueReminder {
  return {
    applicationId: "app-1",
    destination: "china",
    studentName: "Ayesha",
    email: "ayesha@example.com",
    phone: "01700000000",
    deadlineId: "deadline-1",
    window: 14,
    daysRemaining: 14,
    intakeLabel: "Fall 2026",
    applicationDeadline: "2026-09-01",
    ...overrides,
  };
}

function memoryStore(initial: string[] = []) {
  const sent = new Set(initial);

  return {
    sent,
    deps: {
      loadSentKeys: async (items: readonly DueReminder[]) => {
        const keys = new Set<string>();
        for (const item of items) {
          const key = reminderKey(item);
          if (sent.has(key)) {
            keys.add(key);
          }
        }
        return keys;
      },
      recordSent: async (item: DueReminder) => {
        sent.add(reminderKey(item));
      },
    },
  };
}

test("the first run emails a 14-day reminder and a rerun sends nothing", async () => {
  const store = memoryStore();
  const emails: string[] = [];
  const sms: string[] = [];
  const item = due();

  const first = await sendAndRecord([item], {
    ...store.deps,
    sendEmail: async (input) => {
      emails.push(input.to);
      return { id: "email-1", dryRun: false };
    },
    sendSms: async (input) => {
      sms.push(input.to);
      return { dryRun: false };
    },
  });

  assert.equal(first.sent, 1);
  assert.equal(first.emails, 1);
  assert.equal(first.sms, 0);
  assert.deepEqual(emails, ["ayesha@example.com"]);
  assert.equal(sms.length, 0);

  const second = await sendAndRecord([item], {
    ...store.deps,
    sendEmail: async (input) => {
      emails.push(input.to);
      return { id: "email-2", dryRun: false };
    },
    sendSms: async (input) => {
      sms.push(input.to);
      return { dryRun: false };
    },
  });

  assert.equal(second.sent, 0);
  assert.equal(second.skipped, 1);
  assert.equal(second.emails, 0);
  assert.deepEqual(emails, ["ayesha@example.com"]);
});

test("a 2-day window sends email and SMS", async () => {
  const store = memoryStore();
  const channels: string[] = [];
  const item = due({ window: 2, daysRemaining: 2 });

  const result = await sendAndRecord([item], {
    ...store.deps,
    sendEmail: async () => {
      channels.push("email");
      return { id: "email-1", dryRun: false };
    },
    sendSms: async () => {
      channels.push("sms");
      return { dryRun: false };
    },
  });

  assert.equal(result.emails, 1);
  assert.equal(result.sms, 1);
  assert.deepEqual(channels, ["email", "sms"]);
  assert.equal(store.sent.has(reminderKey(item)), true);
});

test("email failure does not record the reminder so a retry can send", async () => {
  const store = memoryStore();
  const item = due();

  await assert.rejects(
    () =>
      sendAndRecord([item], {
        ...store.deps,
        sendEmail: async () => {
          throw new Error("Resend down");
        },
        sendSms: async () => ({ dryRun: false }),
      }),
    /Resend down/,
  );

  assert.equal(store.sent.size, 0);
});

test("SMS failure after a successful email still records the window", async () => {
  const store = memoryStore();
  const item = due({ window: 2, daysRemaining: 2 });

  const result = await sendAndRecord([item], {
    ...store.deps,
    sendEmail: async () => ({ id: "email-1", dryRun: false }),
    sendSms: async () => {
      throw new Error("aggregator 500");
    },
  });

  assert.equal(result.sent, 1);
  assert.equal(result.emails, 1);
  assert.equal(result.sms, 0);
  assert.equal(store.sent.has(reminderKey(item)), true);
});
