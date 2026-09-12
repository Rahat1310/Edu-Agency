import assert from "node:assert/strict";
import { test } from "node:test";

import { sendWhatsAppMessage, whatsappRecipient } from "@/lib/whatsapp/send";

test("Bangladeshi local numbers become Cloud API recipients", () => {
  assert.equal(whatsappRecipient("01700000000"), "8801700000000");
  assert.equal(whatsappRecipient("+880 1700-000000"), "8801700000000");
});

test("missing WhatsApp keys are a dry-run and do not throw", async () => {
  const previousToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const previousId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.WHATSAPP_ACCESS_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;

  try {
    const result = await sendWhatsAppMessage({
      to: "01700000000",
      template: {
        name: "nurture_idle_5",
        language: "en",
        bodyParameters: ["Ayesha", "China"],
      },
    });
    assert.equal(result.dryRun, true);
    assert.equal(result.mode, "template");
  } finally {
    if (previousToken === undefined) {
      delete process.env.WHATSAPP_ACCESS_TOKEN;
    } else {
      process.env.WHATSAPP_ACCESS_TOKEN = previousToken;
    }
    if (previousId === undefined) {
      delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    } else {
      process.env.WHATSAPP_PHONE_NUMBER_ID = previousId;
    }
  }
});
