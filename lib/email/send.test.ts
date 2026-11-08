import assert from "node:assert/strict";
import { test } from "node:test";

import {
  sendTransactionalEmail,
  EmailAcceptanceUncertainError,
} from "@/lib/email/send";
import { sendSms } from "@/lib/sms/send";

test("missing email provider keys is a dry-run and does not throw", async () => {
  const savedEnv = { ...process.env };
  delete process.env.RESEND_API_KEY;
  delete process.env.BREVO_API_KEY;

  try {
    const result = await sendTransactionalEmail({
      to: "student@example.com",
      subject: "Test",
      text: "Hello",
    });
    assert.equal(result.dryRun, true);
    assert.equal(result.id, null);
  } finally {
    process.env = savedEnv;
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

test("Brevo sends student email with verified sender, reply-to and stable idempotency key", async () => {
  const savedEnv = { ...process.env };
  const originalFetch = global.fetch;
  process.env.BREVO_API_KEY = "brevo_mock";
  process.env.RESEND_API_KEY = "resend_should_not_be_used";
  process.env.EMAIL_FROM = "Study Abroad Consultant <support@example.com>";
  process.env.EMAIL_REPLY_TO = "replies@example.com";
  try {
    global.fetch = async (url, init) => {
      assert.equal(url, "https://api.brevo.com/v3/smtp/email");
      assert.equal(new Headers(init?.headers).get("api-key"), "brevo_mock");
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(body.sender, {
        name: "Study Abroad Consultant",
        email: "support@example.com",
      });
      assert.deepEqual(body.to, [{ email: "student@example.com" }]);
      assert.deepEqual(body.replyTo, { email: "replies@example.com" });
      assert.equal(body.headers.IdempotencyKey, "receipt-test");
      assert.equal(body.textContent, "Hello <student>");
      assert.ok(body.htmlContent.includes("&lt;student&gt;"));
      return new Response(JSON.stringify({ messageId: "brevo-test-message" }), {
        status: 201,
      });
    };
    assert.deepEqual(
      await sendTransactionalEmail({
        to: "student@example.com",
        subject: "Your confirmation",
        text: "Hello <student>",
        idempotencyKey: "receipt-test",
      }),
      { id: "brevo-test-message", dryRun: false },
    );
  } finally {
    global.fetch = originalFetch;
    process.env = savedEnv;
  }
});

test("Brevo errors do not expose credentials or provider bodies; uncertain sends require review", async () => {
  const savedEnv = { ...process.env };
  const originalFetch = global.fetch;
  process.env.BREVO_API_KEY = "brevo_mock";
  process.env.EMAIL_FROM = "support@example.com";
  const input = { to: "student@example.com", subject: "Test", text: "Hello" };
  try {
    global.fetch = async () =>
      new Response("private provider body", { status: 429 });
    await assert.rejects(
      () => sendTransactionalEmail(input),
      (error: unknown) =>
        error instanceof Error &&
        error.message.includes("429") &&
        !error.message.includes("private"),
    );
    global.fetch = async () => {
      throw new Error("private network error");
    };
    await assert.rejects(
      () => sendTransactionalEmail(input),
      EmailAcceptanceUncertainError,
    );
    global.fetch = async () =>
      new Response("private provider body", { status: 503 });
    await assert.rejects(
      () => sendTransactionalEmail(input),
      EmailAcceptanceUncertainError,
    );
    global.fetch = async () => new Response("{}", { status: 201 });
    await assert.rejects(
      () => sendTransactionalEmail(input),
      EmailAcceptanceUncertainError,
    );
  } finally {
    global.fetch = originalFetch;
    process.env = savedEnv;
  }
});
