import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { leads, messages } from "@/db/schema";

export type LinkUnmatchedMessageResult =
  { ok: true } | { ok: false; message: string };

export async function linkUnmatchedMessage(input: {
  messageId: string;
  leadId: string;
}): Promise<LinkUnmatchedMessageResult> {
  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(eq(leads.id, input.leadId))
    .limit(1);

  if (!lead) {
    return { ok: false, message: "That lead is no longer on the desk." };
  }

  const [updated] = await db
    .update(messages)
    .set({ leadId: input.leadId })
    .where(and(eq(messages.id, input.messageId), isNull(messages.leadId)))
    .returning({ id: messages.id });

  if (!updated) {
    return {
      ok: false,
      message: "That message is no longer unmatched.",
    };
  }

  return { ok: true };
}
