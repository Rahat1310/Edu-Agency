import type { AiProviderId, AiTask } from "@/lib/ai/types";

export type AiUsageAttempt = {
  provider: AiProviderId;
  task: AiTask;
  tokensIn: number;
  tokensOut: number;
  success: boolean;
};

export type RecordAiUsageFn = (entry: AiUsageAttempt) => Promise<void>;
