import {
  marketingChatSystemPrompt,
  parseAssistantReply,
} from "@/lib/ai/chat-prompt";
import { needsHumanHandoff } from "@/lib/ai/chat-intent";
import {
  FAQ_CACHE_TTL_SECONDS,
  faqCacheKey,
  type FaqCache,
} from "@/lib/ai/faq-cache";
import { normalizeQuestion } from "@/lib/ai/normalize-question";
import type {
  AiMessage,
  ChatCompletionOptions,
  ChatCompletionResult,
} from "@/lib/ai/types";
import type { Locale } from "@/lib/i18n/config";

export type CompleteChatFn = (
  task: "chat",
  messages: readonly AiMessage[],
  options?: ChatCompletionOptions,
) => Promise<ChatCompletionResult>;

export type AnswerChatInput = {
  message: string;
  locale: Locale;
};

export type AnswerChatResult = {
  text: string;
  offerLead: boolean;
  cached: boolean;
  emptyQuestion?: boolean;
};

type CachedPayload = {
  text: string;
  offerLead: boolean;
};

function parseCachedPayload(raw: string): CachedPayload | null {
  let data: unknown = raw;

  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  if (typeof record.text !== "string") {
    return null;
  }

  return {
    text: record.text,
    offerLead: record.offerLead === true,
  };
}

/**
 * FAQ path: normalize → human handoff → hashed Redis cache → gateway.
 * Callers inject `complete` so tests never import the gateway.
 */
export async function answerMarketingChat(
  input: AnswerChatInput,
  deps: { complete: CompleteChatFn; cache: FaqCache },
): Promise<AnswerChatResult> {
  const normalized = normalizeQuestion(input.message);

  if (!normalized) {
    return { text: "", offerLead: false, cached: false, emptyQuestion: true };
  }

  if (needsHumanHandoff(input.message)) {
    return { text: "", offerLead: true, cached: false };
  }

  const key = faqCacheKey(input.locale, normalized);
  const hit = await deps.cache.get(key);

  if (hit) {
    const parsed = parseCachedPayload(hit);
    if (parsed) {
      return { ...parsed, cached: true };
    }
  }

  const result = await deps.complete(
    "chat",
    [
      { role: "system", content: marketingChatSystemPrompt(input.locale) },
      { role: "user", content: input.message.trim() },
    ],
    { temperature: 0.2, maxTokens: 400 },
  );

  const parsed = parseAssistantReply(result.text);

  if (!parsed.text && !parsed.offerLead) {
    throw new Error("empty_completion");
  }

  await deps.cache.set(key, JSON.stringify(parsed), FAQ_CACHE_TTL_SECONDS);

  return { ...parsed, cached: false };
}
