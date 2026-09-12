import { z } from "zod";

import { LOCALES } from "@/lib/i18n/config";

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Write a question first")
    .max(1000, "Keep the question under 1,000 characters"),
  locale: z.enum(LOCALES).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
