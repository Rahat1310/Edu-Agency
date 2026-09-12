import { z } from "zod";

export const linkUnmatchedMessageSchema = z.object({
  messageId: z.string().uuid(),
  leadId: z.string().uuid(),
});

export type LinkUnmatchedMessageInput = z.infer<
  typeof linkUnmatchedMessageSchema
>;

export const unmatchedMessagesQuerySchema = z.object({
  q: z.string().trim().max(120).catch(""),
});

export type UnmatchedMessagesQuery = z.infer<
  typeof unmatchedMessagesQuerySchema
>;
