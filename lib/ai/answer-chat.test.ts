import assert from "node:assert/strict";
import { test } from "node:test";

import { answerMarketingChat, type CompleteChatFn } from "@/lib/ai/answer-chat";
import { needsHumanHandoff } from "@/lib/ai/chat-intent";
import {
  MARKETING_CHAT_LEAD_MARKER,
  marketingChatSystemPrompt,
  parseAssistantReply,
} from "@/lib/ai/chat-prompt";
import { createMemoryFaqCache } from "@/lib/ai/faq-cache";
import { normalizeQuestion } from "@/lib/ai/normalize-question";

function completeOnce(text: string): { fn: CompleteChatFn; calls: number[] } {
  const calls: number[] = [];
  let count = 0;

  return {
    calls,
    fn: async (task, messages) => {
      count += 1;
      calls.push(count);
      assert.equal(task, "chat");
      assert.equal(messages[0]?.role, "system");
      assert.match(messages[0]?.content ?? "", /must not invent/i);
      assert.equal(messages[1]?.role, "user");
      return {
        text,
        provider: "groq",
        tokensIn: 20,
        tokensOut: 8,
      };
    },
  };
}

test("normalizeQuestion lowercases, trims, and strips punctuation", () => {
  assert.equal(
    normalizeQuestion("  What Countries do you cover??? "),
    "what countries do you cover",
  );
  assert.equal(
    normalizeQuestion("What countries do you cover?"),
    normalizeQuestion("what countries do you cover"),
  );
});

test("punctuation-only questions skip the gateway", async () => {
  const complete = completeOnce("should not run");
  const result = await answerMarketingChat(
    { message: "???", locale: "en" },
    { complete: complete.fn, cache: createMemoryFaqCache() },
  );

  assert.equal(complete.calls.length, 0);
  assert.equal(result.emptyQuestion, true);
});

test("asking the same question twice calls the gateway once; the second answer is cached", async () => {
  const cache = createMemoryFaqCache();
  const complete = completeOnce(
    "We counsel China, India, Malaysia, and South Korea.",
  );

  const first = await answerMarketingChat(
    { message: "Which countries do you help with?", locale: "en" },
    { complete: complete.fn, cache },
  );
  const second = await answerMarketingChat(
    { message: "which countries do you help with???", locale: "en" },
    { complete: complete.fn, cache },
  );

  assert.equal(complete.calls.length, 1);
  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(first.text, second.text);
  assert.equal(second.offerLead, false);
});

test("pricing negotiation offers a lead and never calls the gateway", async () => {
  const cache = createMemoryFaqCache();
  const complete = completeOnce("should not run");

  const result = await answerMarketingChat(
    {
      message: "Can you give me a discount on your consultancy fee?",
      locale: "en",
    },
    { complete: complete.fn, cache },
  );

  assert.equal(complete.calls.length, 0);
  assert.equal(result.offerLead, true);
  assert.equal(result.cached, false);
});

test("needsHumanHandoff catches personal cases and ignores destination FAQs", () => {
  assert.equal(needsHumanHandoff("My IELTS is 5.0 — can I still apply?"), true);
  assert.equal(needsHumanHandoff("আপনাদের ফি কত?"), true);
  assert.equal(needsHumanHandoff("Which countries do you help with?"), false);
  assert.equal(
    needsHumanHandoff("What documents do I need for a China JW201?"),
    false,
  );
});

test("the system prompt forbids inventing visa and document specifics", () => {
  const prompt = marketingChatSystemPrompt("en");
  assert.match(prompt, /must not invent/i);
  assert.match(prompt, /JW201/);
  assert.match(prompt, /do not guess/i);
  assert.match(prompt, /China, India, Malaysia, and South Korea/);
  assert.match(prompt, /application → admission → visa → arrival/);
});

test("visa document questions go to the model instead of a silent lead offer", async () => {
  const cache = createMemoryFaqCache();
  const complete = completeOnce(
    "I do not have the current JW201 checklist. A counselor will walk through the live list with you.",
  );

  const result = await answerMarketingChat(
    { message: "What documents do I need for a China JW201?", locale: "en" },
    { complete: complete.fn, cache },
  );

  assert.equal(complete.calls.length, 1);
  assert.equal(result.offerLead, false);
  assert.match(result.text, /do not have the current JW201/i);
});

test("parseAssistantReply treats the lead marker as a handoff", () => {
  const parsed = parseAssistantReply(
    `${MARKETING_CHAT_LEAD_MARKER}\nLet me connect you with a counselor.`,
  );
  assert.equal(parsed.offerLead, true);
  assert.equal(parsed.text, "Let me connect you with a counselor.");
  assert.equal(
    parseAssistantReply("We help with four countries.").offerLead,
    false,
  );
});
