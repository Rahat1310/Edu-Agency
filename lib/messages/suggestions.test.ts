import assert from "node:assert/strict";
import { test } from "node:test";

import {
  mergeLeadOptions,
  suggestedLeadsForMessage,
} from "@/lib/messages/suggestions";
import type { DeskLeadMatch } from "@/lib/messages/types";

function lead(overrides: Partial<DeskLeadMatch> = {}): DeskLeadMatch {
  return {
    id: "lead-1",
    name: "Ayesha",
    phone: "01700000000",
    whatsapp: null,
    status: "new",
    destinationInterest: "china",
    ...overrides,
  };
}

test("WhatsApp unmatched rows suggest leads by phone or WhatsApp number", () => {
  const byPhone = suggestedLeadsForMessage(
    { channel: "whatsapp", externalSenderId: "8801700000000" },
    [lead(), lead({ id: "lead-2", phone: "01811111111" })],
  );
  assert.deepEqual(
    byPhone.map((row) => row.id),
    ["lead-1"],
  );

  const byWhatsapp = suggestedLeadsForMessage(
    { channel: "whatsapp", externalSenderId: "01799999999" },
    [lead({ whatsapp: "+880 1799-999999" })],
  );
  assert.equal(byWhatsapp.length, 1);
});

test("Messenger unmatched rows have no phone suggestions", () => {
  const matches = suggestedLeadsForMessage(
    { channel: "messenger", externalSenderId: "psid-1" },
    [lead()],
  );
  assert.equal(matches.length, 0);
});

test("mergeLeadOptions keeps suggestions first and drops duplicate search hits", () => {
  const suggested = [lead({ id: "lead-1", name: "Ayesha" })];
  const searched = [
    lead({ id: "lead-1", name: "Ayesha duplicate" }),
    lead({ id: "lead-2", name: "Karim", phone: "01800000000" }),
  ];

  const merged = mergeLeadOptions(suggested, searched);
  assert.deepEqual(
    merged.map((row) => row.id),
    ["lead-1", "lead-2"],
  );
  assert.equal(merged[0]?.name, "Ayesha");
});
