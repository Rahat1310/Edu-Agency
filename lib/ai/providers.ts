import {
  AI_PROVIDER_TIMEOUT_MS,
  aiProviderEndpoints,
  aiProviderModels,
} from "@/lib/ai/config";
import type {
  AiMessage,
  AiProviderId,
  ChatCompletionOptions,
  ChatCompletionResult,
} from "@/lib/ai/types";

export type ProviderCallInput = {
  provider: AiProviderId;
  apiKey: string;
  messages: readonly AiMessage[];
  options?: ChatCompletionOptions;
  fetch: typeof fetch;
};

class ProviderAttemptError extends Error {
  constructor() {
    super("provider attempt failed");
    this.name = "ProviderAttemptError";
  }
}

export async function callProvider(
  input: ProviderCallInput,
): Promise<ChatCompletionResult> {
  const signal = mergeSignals(input.options?.signal);

  try {
    if (input.provider === "gemini") {
      return await callGemini(input, signal);
    }

    return await callOpenAiCompatible(input, signal);
  } catch (error) {
    if (isCallerAbort(input.options?.signal)) {
      throw error;
    }

    throw new ProviderAttemptError();
  }
}

export function isCallerAbort(callerSignal?: AbortSignal): boolean {
  return Boolean(callerSignal?.aborted);
}

function mergeSignals(caller?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(AI_PROVIDER_TIMEOUT_MS);
  if (!caller) {
    return timeout;
  }

  return AbortSignal.any([timeout, caller]);
}

async function callOpenAiCompatible(
  input: ProviderCallInput,
  signal: AbortSignal,
): Promise<ChatCompletionResult> {
  const model = aiProviderModels[input.provider];
  const url = aiProviderEndpoints[input.provider];
  const headers: Record<string, string> = {
    Authorization: `Bearer ${input.apiKey}`,
    "Content-Type": "application/json",
  };

  if (input.provider === "openrouter") {
    const referer = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (referer) {
      headers["HTTP-Referer"] = referer;
    }
    headers["X-Title"] = "Study Abroad Consultancy";
  }

  const body: Record<string, unknown> = {
    model,
    messages: input.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  };

  if (input.options?.temperature !== undefined) {
    body.temperature = input.options.temperature;
  }

  if (input.options?.maxTokens !== undefined) {
    body.max_tokens = input.options.maxTokens;
  }

  const response = await input.fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new ProviderAttemptError();
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: unknown } }[];
    usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
  };

  const text = stringifyContent(payload.choices?.[0]?.message?.content);
  if (!text) {
    throw new ProviderAttemptError();
  }

  return {
    text,
    provider: input.provider,
    tokensIn: asTokenCount(payload.usage?.prompt_tokens),
    tokensOut: asTokenCount(payload.usage?.completion_tokens),
  };
}

async function callGemini(
  input: ProviderCallInput,
  signal: AbortSignal,
): Promise<ChatCompletionResult> {
  const response = await input.fetch(aiProviderEndpoints.gemini, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": input.apiKey,
    },
    body: JSON.stringify(geminiBody(input.messages, input.options)),
    signal,
  });

  if (!response.ok) {
    throw new ProviderAttemptError();
  }

  const payload = (await response.json()) as {
    candidates?: {
      content?: { parts?: { text?: unknown }[] };
    }[];
    usageMetadata?: {
      promptTokenCount?: unknown;
      candidatesTokenCount?: unknown;
    };
  };

  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text) {
    throw new ProviderAttemptError();
  }

  return {
    text,
    provider: "gemini",
    tokensIn: asTokenCount(payload.usageMetadata?.promptTokenCount),
    tokensOut: asTokenCount(payload.usageMetadata?.candidatesTokenCount),
  };
}

function geminiBody(
  messages: readonly AiMessage[],
  options?: ChatCompletionOptions,
) {
  const system = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n")
    .trim();

  const turns: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      continue;
    }

    const role = message.role === "assistant" ? "model" : "user";
    const previous = turns[turns.length - 1];
    if (previous?.role === role) {
      const existing = previous.parts[0]?.text ?? "";
      previous.parts[0] = { text: `${existing}\n\n${message.content}` };
      continue;
    }

    turns.push({ role, parts: [{ text: message.content }] });
  }

  if (turns.length === 0) {
    turns.push({
      role: "user",
      parts: [{ text: system || "Hello" }],
    });
  } else if (turns[0]?.role === "model") {
    turns.unshift({ role: "user", parts: [{ text: "Continue." }] });
  }

  return {
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    contents: turns,
    generationConfig: {
      ...(options?.temperature !== undefined
        ? { temperature: options.temperature }
        : {}),
      ...(options?.maxTokens !== undefined
        ? { maxOutputTokens: options.maxTokens }
        : {}),
    },
  };
}

function stringifyContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }
        return "";
      })
      .join("")
      .trim();
  }

  return "";
}

function asTokenCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : 0;
}
