import assert from "node:assert/strict";
import { test } from "node:test";

import {
  AI_USAGE_WARNING_RATIO,
  aiProviderDailyCaps,
  crossesUsageWarning,
  shiftYmd,
  usagePercent,
  usageWindowDays,
  warningThreshold,
} from "@/lib/ai/usage-caps";
import { summarizeProviderUsage } from "@/lib/ai/usage-view";

test("80% of the daily request cap is the visual warning line", () => {
  assert.equal(AI_USAGE_WARNING_RATIO, 0.8);
  assert.equal(warningThreshold(aiProviderDailyCaps.gemini.requests), 1_200);
  assert.equal(warningThreshold(aiProviderDailyCaps.openrouter.requests), 40);
  assert.equal(warningThreshold(aiProviderDailyCaps.groq.requests), 11_520);

  assert.equal(crossesUsageWarning(1_199, 1_500), false);
  assert.equal(crossesUsageWarning(1_200, 1_500), true);
  assert.equal(crossesUsageWarning(40, 50), true);
  assert.equal(usagePercent(750, 1_500), 50);
});

test("today's totals per provider flag a row over 80% of the reference cap", () => {
  const today = "2026-08-16";
  const days = usageWindowDays(today, 7);
  assert.equal(days[0], shiftYmd(today, -6));
  assert.equal(days[6], today);

  const summaries = summarizeProviderUsage(today, days, [
    {
      day: today,
      provider: "gemini",
      calls: 1_200,
      successes: 1_100,
      failures: 100,
      tokensIn: 40_000,
      tokensOut: 8_000,
    },
    {
      day: today,
      provider: "groq",
      calls: 10,
      successes: 10,
      failures: 0,
      tokensIn: 100,
      tokensOut: 40,
    },
    {
      day: shiftYmd(today, -1),
      provider: "groq",
      calls: 5,
      successes: 5,
      failures: 0,
      tokensIn: 50,
      tokensOut: 20,
    },
  ]);

  const gemini = summaries.find((row) => row.provider === "gemini");
  const groq = summaries.find((row) => row.provider === "groq");
  const openrouter = summaries.find((row) => row.provider === "openrouter");

  assert.equal(gemini?.todayCalls, 1_200);
  assert.equal(gemini?.warned, true);
  assert.equal(gemini?.percentOfCap, 80);
  assert.equal(groq?.todayCalls, 10);
  assert.equal(groq?.weekCalls, 15);
  assert.equal(groq?.warned, false);
  assert.equal(openrouter?.todayCalls, 0);
  assert.equal(openrouter?.warned, false);
});
