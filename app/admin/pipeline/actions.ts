"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardAccess } from "@/lib/auth-helpers";
import { persistLeadStageChange } from "@/lib/leads/move-stage";
import { moveLeadStageSchema } from "@/lib/schemas/lead";
import { validateRequest } from "@/lib/validation-helpers";

export type MoveLeadStageResult = { ok: true } | { ok: false; message: string };

export async function moveLeadStage(
  input: unknown,
): Promise<MoveLeadStageResult> {
  const user = await requireDashboardAccess();
  const parsed = validateRequest(moveLeadStageSchema, input);

  if (!parsed.success) {
    return { ok: false, message: "That stage change is not valid." };
  }

  if (parsed.data.forceFail && process.env.NODE_ENV !== "production") {
    return {
      ok: false,
      message: "Simulated failure — the card was not saved.",
    };
  }

  const result = await persistLeadStageChange({
    leadId: parsed.data.leadId,
    fromStatus: parsed.data.fromStatus,
    toStatus: parsed.data.toStatus,
    actorUserId: user.id,
  });

  if (result.ok) {
    revalidatePath("/admin/pipeline");
    revalidatePath("/admin/leads");
    revalidatePath("/admin/performance");
    revalidatePath("/portal");
  }

  return result;
}
