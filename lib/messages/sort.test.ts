import assert from "node:assert/strict";
import { test } from "node:test";

import { sortAutomationEvents, sortThreadMessages } from "@/lib/messages/sort";
import type { DeskThreadMessage } from "@/lib/messages/types";

function message(
  overrides: Partial<DeskThreadMessage> & Pick<DeskThreadMessage, "id">,
): DeskThreadMessage {
  return {
    channel: "whatsapp",
    direction: "inbound",
    body: "hello",
    createdAt: "2026-08-17T04:00:00.000Z",
    ...overrides,
  };
}

test("interleaves WhatsApp and Messenger by createdAt then id", () => {
  const whatsappLater = message({
    id: "wa-2",
    channel: "whatsapp",
    body: "WhatsApp later",
    createdAt: "2026-08-17T06:00:00.000Z",
  });
  const messengerMid = message({
    id: "ms-1",
    channel: "messenger",
    body: "Messenger mid",
    createdAt: "2026-08-17T05:00:00.000Z",
  });
  const whatsappFirst = message({
    id: "wa-1",
    channel: "whatsapp",
    body: "WhatsApp first",
    createdAt: "2026-08-17T04:00:00.000Z",
  });

  const ordered = sortThreadMessages([
    whatsappLater,
    messengerMid,
    whatsappFirst,
  ]);

  assert.deepEqual(
    ordered.map((row) => row.id),
    ["wa-1", "ms-1", "wa-2"],
  );
  assert.deepEqual(
    ordered.map((row) => row.channel),
    ["whatsapp", "messenger", "whatsapp"],
  );
});

test("same timestamp falls back to id so order is stable", () => {
  const stamp = "2026-08-17T04:00:00.000Z";
  const ordered = sortThreadMessages([
    message({ id: "b", channel: "messenger", createdAt: stamp }),
    message({ id: "a", channel: "whatsapp", createdAt: stamp }),
  ]);

  assert.deepEqual(
    ordered.map((row) => row.id),
    ["a", "b"],
  );
});

test("automation history is chronological by sentAt", () => {
  const ordered = sortAutomationEvents([
    { id: "n-2", sentAt: "2026-08-17T10:00:00.000Z" },
    { id: "r-1", sentAt: "2026-08-17T08:00:00.000Z" },
    { id: "n-1", sentAt: "2026-08-17T09:00:00.000Z" },
  ]);

  assert.deepEqual(
    ordered.map((row) => row.id),
    ["r-1", "n-1", "n-2"],
  );
});
