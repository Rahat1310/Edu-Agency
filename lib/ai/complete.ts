import { aiTaskProviders } from "@/lib/ai/config";
import { callProvider, isCallerAbort } from "@/lib/ai/providers";
import {
  AiGatewayError,
  aiMessageRoles,
  type AiMessage,
  type AiProviderId,
  type AiTask,
  type ChatCompletionOptions,
  type ChatCompletionResult,
} from "@/lib/ai/types";
import type { AiUsageAttempt, RecordAiUsageFn } from "@/lib/ai/usage-types";

export type ChatCompletionDeps = {
  fetch: typeof fetch;
  keys: Partial<Record<AiProviderId, string>>;
  recordUsage?: RecordAiUsageFn;
};

const messageSchemaOk = (message: AiMessage): boolean =>
  (aiMessageRoles as readonly string[]).includes(message.role) &&
  typeof message.content === "string" &&
  message.content.trim().length > 0;

export async function runChatCompletion(
  task: AiTask,
  messages: readonly AiMessage[],
  options: ChatCompletionOptions | undefined,
  deps: ChatCompletionDeps,
): Promise<ChatCompletionResult> {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AiGatewayError("invalid_request", "That request was not valid.");
  }

  for (const message of messages) {
    if (!messageSchemaOk(message)) {
      throw new AiGatewayError(
        "invalid_request",
        "That request was not valid.",
      );
    }
  }

  const chain = aiTaskProviders[task];
  if (!chain) {
    throw new AiGatewayError("invalid_request", "That request was not valid.");
  }

  for (const provider of chain) {
    if (isCallerAbort(options?.signal)) {
      throw options?.signal?.reason instanceof Error
        ? options.signal.reason
        : new DOMException("Aborted", "AbortError");
    }

    const apiKey = deps.keys[provider]?.trim();
    if (!apiKey) {
      continue;
    }

    try {
      const result = await callProvider({
        provider,
        apiKey,
        messages,
        options,
        fetch: deps.fetch,
      });
      await recordAttempt(deps.recordUsage, {
        provider,
        task,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        success: true,
      });
      return result;
    } catch (error) {
      if (isCallerAbort(options?.signal)) {
        throw error;
      }

      await recordAttempt(deps.recordUsage, {
        provider,
        task,
        tokensIn: 0,
        tokensOut: 0,
        success: false,
      });
    }
  }

  throw new AiGatewayError(
    "all_failed",
    "All AI providers failed for this request.",
  );
}

async function recordAttempt(
  recordUsage: RecordAiUsageFn | undefined,
  entry: AiUsageAttempt,
) {
  if (!recordUsage) {
    return;
  }

  try {
    await recordUsage(entry);
  } catch {
    // A log miss must not fail chat or matching.
  }
}
