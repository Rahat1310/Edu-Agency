import assert from "node:assert/strict";
import { test } from "node:test";

import {
  nurtureHistoryLabel,
  reminderHistoryLabel,
  threadMessageAriaLabel,
} from "@/lib/messages/labels";
import type { DeskThreadMessage } from "@/lib/messages/types";

const base: DeskThreadMessage = {
  id: "m-1",
  channel: "whatsapp",
  direction: "inbound",
  body: "Need help with China",
  createdAt: "2026-08-17T04:00:00.000Z",
};

test("aria label announces WhatsApp inbound channel and direction", () => {
  const label = threadMessageAriaLabel(base);

  assert.match(label, /^WhatsApp, received from the student\./);
  assert.match(label, /Need help with China/);
});

test("aria label announces Messenger outbound channel and direction", () => {
  const label = threadMessageAriaLabel({
    ...base,
    channel: "messenger",
    direction: "outbound",
    body: "We can continue on the portal",
  });

  assert.match(label, /^Messenger, sent by the agency\./);
  assert.match(label, /We can continue on the portal/);
});

test("empty body is announced as no text", () => {
  const label = threadMessageAriaLabel({ ...base, body: "   " });
  assert.match(label, /no text/);
});

test("nurture and reminder history labels name the channel or window", () => {
  assert.equal(
    nurtureHistoryLabel("idle-5", "whatsapp"),
    "Nurture idle-5 via WhatsApp",
  );
  assert.equal(reminderHistoryLabel(14), "Intake reminder (14 days out)");
});
