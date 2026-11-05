import assert from "node:assert/strict";
import { test } from "node:test";
import { sendWhatsAppMessage, WhatsAppRequestError } from "../whatsapp/send";
import { sendTransactionalEmail } from "../email/send";
test("official template is sent only to supplied office recipient; errors are classified", async () => {
  const original = global.fetch;
  const env = { ...process.env };
  process.env.WHATSAPP_ACCESS_TOKEN = "mock";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "mock";
  try {
    global.fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      assert.equal(body.to, "8801712345678");
      assert.equal(body.type, "template");
      assert.equal(body.template.components[0].parameters.length, 5);
      return new Response(
        JSON.stringify({ messages: [{ id: "mock-message" }] }),
      );
    };
    const result = await sendWhatsAppMessage({
      to: "+8801712345678",
      template: {
        name: "test",
        language: "en",
        bodyParameters: [
          "SAC-TEST",
          "China",
          "Master's",
          "Pending assignment",
          "https://example.com/admin/leads/test",
        ],
      },
    });
    assert.equal(result.id, "mock-message");
    assert.equal(result.dryRun, false);
    global.fetch = async () =>
      new Response(
        JSON.stringify({ error: { message: "private provider body" } }),
        { status: 429 },
      );
    await assert.rejects(
      () => sendWhatsAppMessage({ to: "+8801712345678", text: "test" }),
      (e) =>
        e instanceof WhatsAppRequestError &&
        e.status === 429 &&
        !e.message.includes("private"),
    );
  } finally {
    global.fetch = original;
    process.env = env;
  }
});
test("transactional email uses verified sender and provider idempotency", async () => {
  const original = global.fetch;
  const env = { ...process.env };
  process.env.RESEND_API_KEY = "re_mock";
  process.env.EMAIL_FROM = "Test <test@example.com>";
  try {
    global.fetch = async (_url, init) => {
      assert.ok(new Headers(init?.headers).get("idempotency-key"));
      const body = JSON.parse(String(init?.body));
      assert.equal(
        Array.isArray(body.to) ? body.to[0] : body.to,
        "support@studyabroadconsultantbd.com",
      );
      return new Response(JSON.stringify({ id: "email-test" }), {
        status: 200,
      });
    };
    const r = await sendTransactionalEmail({
      to: "support@studyabroadconsultantbd.com",
      subject: "Mock",
      text: "Mock",
      idempotencyKey: "mock-key",
    });
    assert.equal(r.dryRun, false);
    assert.equal(r.id, "email-test");
    global.fetch = async () =>
      new Response(
        JSON.stringify({ name: "validation_error", message: "mock failure" }),
        { status: 422 },
      );
    await assert.rejects(() =>
      sendTransactionalEmail({
        to: "support@studyabroadconsultantbd.com",
        subject: "Mock",
        text: "Mock",
      }),
    );
  } finally {
    global.fetch = original;
    process.env = env;
  }
});
