import assert from "node:assert/strict";
import { test } from "node:test";

import { sendNurtureAndRecord } from "@/lib/nurture/dispatch";
import type { DueNurture } from "@/lib/nurture/match";
import { nurtureSequence } from "@/lib/nurture/sequence";

const idle5 = nurtureSequence[0];

function due(overrides: Partial<DueNurture> = {}): DueNurture {
  if (!idle5) {
    throw new Error("nurture sequence is empty");
  }

  return {
    leadId: "lead-1",
    name: "Ayesha",
    email: "ayesha@example.com",
    phone: "01700000000",
    whatsapp: "01700000000",
    destinationInterest: "china",
    status: "new",
    step: idle5,
    daysSinceContact: 5,
    lastInboundAt: null,
    ...overrides,
  };
}

function memoryLive(options?: {
  status?: string;
  inbound?: boolean;
  sent?: string[];
}) {
  const statusByLead = new Map<string, string>([
    ["lead-1", options?.status ?? "new"],
  ]);
  const inboundLeadIds = new Set<string>(options?.inbound ? ["lead-1"] : []);
  const sentKeys = new Set(options?.sent ?? []);
  const recorded: { stepId: string; channel: string; content: string }[] = [];

  return {
    recorded,
    deps: {
      loadLiveState: async () => ({ statusByLead, inboundLeadIds, sentKeys }),
      recordSent: async (input: {
        leadId: string;
        stepId: string;
        channel: "whatsapp" | "email";
        actorUserId: string;
        activityContent: string;
        messageBody: string;
      }) => {
        recorded.push({
          stepId: input.stepId,
          channel: input.channel,
          content: input.activityContent,
        });
        sentKeys.add(`${input.leadId}:${input.stepId}`);
      },
      sendWhatsApp: async () => ({
        id: "wamid.1",
        dryRun: false,
        mode: "template" as const,
      }),
      sendEmail: async () => ({ id: "email-1", dryRun: false }),
      actorUserId: "actor-1",
    },
  };
}

test("a stale lead is sent WhatsApp and logged as system activity", async () => {
  const store = memoryLive();
  const result = await sendNurtureAndRecord([due()], store.deps);

  assert.equal(result.sent, 1);
  assert.equal(result.whatsapp, 1);
  assert.equal(store.recorded.length, 1);
  assert.equal(store.recorded[0]?.stepId, "idle-5");
  assert.equal(store.recorded[0]?.channel, "whatsapp");
  assert.match(
    store.recorded[0]?.content ?? "",
    /^Nurture \(idle-5\) sent via whatsapp/,
  );
});

test("email is used when there is no WhatsApp number", async () => {
  const store = memoryLive();
  const result = await sendNurtureAndRecord(
    [due({ phone: "", whatsapp: null })],
    store.deps,
  );

  assert.equal(result.emails, 1);
  assert.equal(result.whatsapp, 0);
  assert.equal(store.recorded[0]?.channel, "email");
});

test("a lead that advanced past contacted is not sent", async () => {
  const store = memoryLive({ status: "documents" });
  const result = await sendNurtureAndRecord([due()], store.deps);

  assert.equal(result.sent, 0);
  assert.equal(result.skipped, 1);
  assert.equal(store.recorded.length, 0);
});

test("a lead that responded is not sent", async () => {
  const store = memoryLive({ inbound: true });
  const result = await sendNurtureAndRecord([due()], store.deps);

  assert.equal(result.sent, 0);
  assert.equal(store.recorded.length, 0);
});

test("an already-logged step is not sent again", async () => {
  const store = memoryLive({ sent: ["lead-1:idle-5"] });
  const result = await sendNurtureAndRecord([due()], store.deps);

  assert.equal(result.sent, 0);
  assert.equal(store.recorded.length, 0);
});
