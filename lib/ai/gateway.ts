import "server-only";

import { runChatCompletion } from "@/lib/ai/complete";
import type {
  AiMessage,
  AiTask,
  ChatCompletionOptions,
  ChatCompletionResult,
} from "@/lib/ai/types";
import { recordAiUsageAttempt } from "@/lib/ai/usage-log";
import { env } from "@/lib/env";

export type {
  AiMessage,
  AiProviderId,
  AiTask,
  ChatCompletionOptions,
  ChatCompletionResult,
} from "@/lib/ai/types";
export { AiGatewayError } from "@/lib/ai/types";
export { aiTaskProviders, aiProviderModels } from "@/lib/ai/config";

/**
 * Single entry point for every AI feature. Callers pass a task and messages;
 * they never import a provider SDK or handle Groq/Gemini/OpenRouter errors.
 */
export async function chatCompletion(
  task: AiTask,
  messages: readonly AiMessage[],
  options?: ChatCompletionOptions,
): Promise<ChatCompletionResult> {
  return runChatCompletion(task, messages, options, {
    fetch: globalThis.fetch.bind(globalThis),
    keys: {
      groq: env.GROQ_API_KEY,
      gemini: env.GEMINI_API_KEY,
      openrouter: env.OPENROUTER_API_KEY,
    },
    recordUsage: recordAiUsageAttempt,
  });
}
