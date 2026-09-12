"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardAccess } from "@/lib/auth-helpers";
import { resolveUnlinkedAccount } from "@/lib/leads/unlinked";
import { resolveUnlinkedSchema } from "@/lib/schemas/portal";
import { validateRequest } from "@/lib/validation-helpers";

export type ResolveUnlinkedActionResult =
  { ok: true } | { ok: false; message: string };

export async function resolveUnlinked(
  input: unknown,
): Promise<ResolveUnlinkedActionResult> {
  const user = await requireDashboardAccess();
  const parsed = validateRequest(resolveUnlinkedSchema, input);

  if (!parsed.success) {
    return { ok: false, message: "That request was not valid." };
  }

  const result = await resolveUnlinkedAccount({
    payload: parsed.data,
    actorUserId: user.id,
  });

  if (result.ok) {
    revalidatePath("/admin/unlinked");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/pipeline");
    revalidatePath("/portal");
  }

  return result;
}
