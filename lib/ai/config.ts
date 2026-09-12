import type { AiProviderId, AiTask } from "@/lib/ai/types";

/**
 * Provider order and model ids — retune here, not at call sites.
 * Last hop in each chain is an OpenRouter `:free` model.
 */
export const AI_PROVIDER_TIMEOUT_MS = 15_000;

export const aiProviderModels: Record<AiProviderId, string> = {
  groq: "llama-3.3-70b-versatile",
  gemini: "gemini-2.5-flash",
  openrouter: "meta-llama/llama-3.3-70b-instruct:free",
};

export const aiTaskProviders: Record<AiTask, readonly AiProviderId[]> = {
  chat: ["groq", "gemini", "openrouter"],
  matching: ["gemini", "groq", "openrouter"],
};

export const aiProviderEndpoints: Record<AiProviderId, string> = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  gemini: `https://generativelanguage.googleapis.com/v1beta/models/${aiProviderModels.gemini}:generateContent`,
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};
