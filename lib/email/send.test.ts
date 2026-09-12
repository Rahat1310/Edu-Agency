import assert from "node:assert/strict";
import { test } from "node:test";

import { sendTransactionalEmail } from "@/lib/email/send";
import { sendSms } from "@/lib/sms/send";

test("missing Resend key is a dry-run and does not throw", async () => {
  const previous = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  try {
    const result = await sendTransactionalEmail({
      to: "student@example.com",
      subject: "Test",
      text: "Hello",
    });
    assert.equal(result.dryRun, true);
    assert.equal(result.id, null);
  } finally {
    if (previous === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = previous;
    }
  }
});

test("missing SMS config is a dry-run and does not throw", async () => {
  const previousUrl = process.env.SMS_API_URL;
  const previousKey = process.env.SMS_API_KEY;
  delete process.env.SMS_API_URL;
  delete process.env.SMS_API_KEY;

  try {
    const result = await sendSms({
      to: "01700000000",
      message: "Hello",
    });
    assert.equal(result.dryRun, true);
  } finally {
    if (previousUrl === undefined) {
      delete process.env.SMS_API_URL;
    } else {
      process.env.SMS_API_URL = previousUrl;
    }
    if (previousKey === undefined) {
      delete process.env.SMS_API_KEY;
    } else {
      process.env.SMS_API_KEY = previousKey;
    }
  }
});
