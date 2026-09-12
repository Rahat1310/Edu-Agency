export const aiTasks = ["chat", "matching"] as const;

export type AiTask = (typeof aiTasks)[number];

export const aiProviders = ["groq", "gemini", "openrouter"] as const;

export type AiProviderId = (typeof aiProviders)[number];

export const aiMessageRoles = ["system", "user", "assistant"] as const;

export type AiMessageRole = (typeof aiMessageRoles)[number];

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type ChatCompletionOptions = {
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
};

export type ChatCompletionResult = {
  text: string;
  provider: AiProviderId;
  tokensIn: number;
  tokensOut: number;
};

export class AiGatewayError extends Error {
  readonly code: "invalid_request" | "all_failed";

  constructor(code: "invalid_request" | "all_failed", message: string) {
    super(message);
    this.name = "AiGatewayError";
    this.code = code;
  }
}
