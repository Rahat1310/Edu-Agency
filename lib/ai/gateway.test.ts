import assert from "node:assert/strict";
import { test } from "node:test";

import { aiProviderEndpoints, aiTaskProviders } from "@/lib/ai/config";
import { runChatCompletion } from "@/lib/ai/complete";
import { AiGatewayError } from "@/lib/ai/types";
import type { AiUsageAttempt } from "@/lib/ai/usage-types";

const messages = [{ role: "user" as const, content: "Hello" }];

const keys = {
  groq: "gsk_test",
  gemini: "gemini_test",
  openrouter: "or_test",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function groqSuccess(text = "hello from groq") {
  return jsonResponse(200, {
    choices: [{ message: { content: text } }],
    usage: { prompt_tokens: 12, completion_tokens: 5 },
  });
}

function geminiSuccess(text = "hello from gemini") {
  return jsonResponse(200, {
    candidates: [{ content: { parts: [{ text }] } }],
    usageMetadata: { promptTokenCount: 9, candidatesTokenCount: 6 },
  });
}

test("chatCompletion('chat') with a valid Groq key reports provider groq", async () => {
  const result = await runChatCompletion("chat", messages, undefined, {
    keys,
    fetch: async (url) => {
      assert.equal(String(url), aiProviderEndpoints.groq);
      return groqSuccess();
    },
  });

  assert.equal(result.provider, "groq");
  assert.equal(result.text, "hello from groq");
  assert.equal(result.tokensIn, 12);
  assert.equal(result.tokensOut, 5);
});

test("an invalid Groq key falls back to Gemini and still returns a result", async () => {
  const urls: string[] = [];

  const result = await runChatCompletion("chat", messages, undefined, {
    keys,
    fetch: async (url) => {
      urls.push(String(url));
      if (String(url) === aiProviderEndpoints.groq) {
        return jsonResponse(401, { error: { message: "Invalid API Key" } });
      }
      if (String(url) === aiProviderEndpoints.gemini) {
        return geminiSuccess();
      }
      throw new Error(`unexpected url ${String(url)}`);
    },
  });

  assert.deepEqual(urls, [
    aiProviderEndpoints.groq,
    aiProviderEndpoints.gemini,
  ]);
  assert.equal(result.provider, "gemini");
  assert.equal(result.text, "hello from gemini");
  assert.equal(result.tokensIn, 9);
  assert.equal(result.tokensOut, 6);
});

test("a Groq 429 rate limit triggers the same Gemini fallback", async () => {
  const result = await runChatCompletion("chat", messages, undefined, {
    keys,
    fetch: async (url) => {
      if (String(url) === aiProviderEndpoints.groq) {
        return jsonResponse(429, { error: { message: "Rate limit reached" } });
      }
      return geminiSuccess("fallback after 429");
    },
  });

  assert.equal(result.provider, "gemini");
  assert.equal(result.text, "fallback after 429");
});

test("matching tries Gemini first, then Groq", async () => {
  assert.deepEqual(aiTaskProviders.matching, ["gemini", "groq", "openrouter"]);
  assert.deepEqual(aiTaskProviders.chat, ["groq", "gemini", "openrouter"]);

  const urls: string[] = [];
  const result = await runChatCompletion("matching", messages, undefined, {
    keys,
    fetch: async (url) => {
      urls.push(String(url));
      return geminiSuccess("match");
    },
  });

  assert.equal(urls[0], aiProviderEndpoints.gemini);
  assert.equal(result.provider, "gemini");
});

test("the caller never sees a provider-specific error when the chain is exhausted", async () => {
  await assert.rejects(
    () =>
      runChatCompletion("chat", messages, undefined, {
        keys,
        fetch: async () =>
          jsonResponse(429, {
            error: { message: "Rate limit reached for groq" },
          }),
      }),
    (error: unknown) => {
      assert.ok(error instanceof AiGatewayError);
      assert.equal(error.code, "all_failed");
      assert.equal(error.message, "All AI providers failed for this request.");
      assert.doesNotMatch(error.message, /groq|gemini|openrouter/i);
      return true;
    },
  );
});

test("a missing Groq key skips Groq and uses Gemini", async () => {
  const urls: string[] = [];
  const result = await runChatCompletion("chat", messages, undefined, {
    keys: { gemini: "gemini_test" },
    fetch: async (url) => {
      urls.push(String(url));
      return geminiSuccess();
    },
  });

  assert.deepEqual(urls, [aiProviderEndpoints.gemini]);
  assert.equal(result.provider, "gemini");
});

function collectUsage() {
  const rows: AiUsageAttempt[] = [];
  return {
    rows,
    recordUsage: async (entry: AiUsageAttempt) => {
      rows.push({ ...entry });
    },
  };
}

test("a successful gateway call writes exactly one usage row", async () => {
  const usage = collectUsage();
  await runChatCompletion("chat", messages, undefined, {
    keys,
    fetch: async () => groqSuccess(),
    recordUsage: usage.recordUsage,
  });

  assert.equal(usage.rows.length, 1);
  assert.deepEqual(usage.rows[0], {
    provider: "groq",
    task: "chat",
    tokensIn: 12,
    tokensOut: 5,
    success: true,
  });
});

test("each failed then successful attempt writes its own usage row", async () => {
  const usage = collectUsage();
  await runChatCompletion("chat", messages, undefined, {
    keys,
    fetch: async (url) => {
      if (String(url) === aiProviderEndpoints.groq) {
        return jsonResponse(429, { error: { message: "Rate limit reached" } });
      }
      return geminiSuccess();
    },
    recordUsage: usage.recordUsage,
  });

  assert.equal(usage.rows.length, 2);
  assert.deepEqual(
    usage.rows.map((row) => [row.provider, row.success, row.task]),
    [
      ["groq", false, "chat"],
      ["gemini", true, "chat"],
    ],
  );
  assert.equal(usage.rows[0]?.tokensIn, 0);
  assert.equal(usage.rows[1]?.tokensIn, 9);
});

test("matching logs the matching task on the Gemini attempt", async () => {
  const usage = collectUsage();
  await runChatCompletion("matching", messages, undefined, {
    keys,
    fetch: async () => geminiSuccess("match"),
    recordUsage: usage.recordUsage,
  });

  assert.equal(usage.rows.length, 1);
  assert.equal(usage.rows[0]?.task, "matching");
  assert.equal(usage.rows[0]?.provider, "gemini");
  assert.equal(usage.rows[0]?.success, true);
});

test("exhausted chain logs one failure row per attempted provider", async () => {
  const usage = collectUsage();
  await assert.rejects(() =>
    runChatCompletion("chat", messages, undefined, {
      keys,
      fetch: async () =>
        jsonResponse(429, { error: { message: "Rate limit" } }),
      recordUsage: usage.recordUsage,
    }),
  );

  assert.deepEqual(
    usage.rows.map((row) => [row.provider, row.success]),
    [
      ["groq", false],
      ["gemini", false],
      ["openrouter", false],
    ],
  );
});

test("a skipped missing key does not write a usage row", async () => {
  const usage = collectUsage();
  await runChatCompletion("chat", messages, undefined, {
    keys: { gemini: "gemini_test" },
    fetch: async () => geminiSuccess(),
    recordUsage: usage.recordUsage,
  });

  assert.equal(usage.rows.length, 1);
  assert.equal(usage.rows[0]?.provider, "gemini");
});

test("an invalid request writes no usage rows", async () => {
  const usage = collectUsage();
  await assert.rejects(
    () =>
      runChatCompletion("chat", [], undefined, {
        keys,
        fetch: async () => groqSuccess(),
        recordUsage: usage.recordUsage,
      }),
    (error: unknown) => error instanceof AiGatewayError,
  );
  assert.equal(usage.rows.length, 0);
});

test("a throwing usage logger does not fail the completion", async () => {
  const result = await runChatCompletion("chat", messages, undefined, {
    keys,
    fetch: async () => groqSuccess(),
    recordUsage: async () => {
      throw new Error("neon unavailable");
    },
  });

  assert.equal(result.provider, "groq");
  assert.equal(result.text, "hello from groq");
});
