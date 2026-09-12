"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardAccess } from "@/lib/auth-helpers";
import { linkUnmatchedMessage as persistLink } from "@/lib/messages/link";
import { linkUnmatchedMessageSchema } from "@/lib/schemas/messages";
import { validateRequest } from "@/lib/validation-helpers";

export type LinkUnmatchedMessageActionResult =
  { ok: true } | { ok: false; message: string };

export async function linkUnmatchedMessage(
  input: unknown,
): Promise<LinkUnmatchedMessageActionResult> {
  await requireDashboardAccess();
  const parsed = validateRequest(linkUnmatchedMessageSchema, input);

  if (!parsed.success) {
    return { ok: false, message: "That request was not valid." };
  }

  const result = await persistLink(parsed.data);

  if (result.ok) {
    revalidatePath("/admin/unmatched-messages");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/pipeline");
  }

  return result;
}
