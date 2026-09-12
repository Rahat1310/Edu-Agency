import "server-only";

import { db } from "@/db";
import { aiUsageLog } from "@/db/schema";
import type { RecordAiUsageFn } from "@/lib/ai/usage-types";

/**
 * One row per provider attempt. Insert failures are swallowed so a Neon
 * blip cannot take down chat or matching.
 */
export const recordAiUsageAttempt: RecordAiUsageFn = async (entry) => {
  try {
    await db.insert(aiUsageLog).values({
      provider: entry.provider,
      task: entry.task,
      tokensIn: entry.tokensIn,
      tokensOut: entry.tokensOut,
      success: entry.success,
    });
  } catch {
    // Visibility must not fail the student-facing call.
  }
};
