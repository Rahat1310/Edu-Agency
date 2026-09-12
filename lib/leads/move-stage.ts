import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { leadActivity, leads, type LeadStatus } from "@/db/schema";
import { ensureVisaApplicationForLead } from "@/lib/visa-applications/ensure";

export type PersistStageChangeResult =
  { ok: true } | { ok: false; message: string };

export async function persistLeadStageChange(input: {
  leadId: string;
  fromStatus: LeadStatus;
  toStatus: LeadStatus;
  actorUserId: string;
}): Promise<PersistStageChangeResult> {
  if (input.fromStatus === input.toStatus) {
    return { ok: true };
  }

  const [moved] = await db
    .update(leads)
    .set({ status: input.toStatus })
    .where(and(eq(leads.id, input.leadId), eq(leads.status, input.fromStatus)))
    .returning({ id: leads.id });

  if (!moved) {
    return {
      ok: false,
      message:
        "This lead was already moved or no longer exists. Refresh the board and try again.",
    };
  }

  try {
    await db.insert(leadActivity).values({
      leadId: input.leadId,
      actorUserId: input.actorUserId,
      type: "stage_change",
      content: null,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
    });
  } catch {
    await db
      .update(leads)
      .set({ status: input.fromStatus })
      .where(eq(leads.id, input.leadId));

    return {
      ok: false,
      message:
        "The stage change could not be recorded. The card was not moved.",
    };
  }

  if (input.toStatus === "visa") {
    try {
      await ensureVisaApplicationForLead(input.leadId);
    } catch {
      // The card is already on Visa. The desk can create the visa file once
      // a student application is linked.
    }
  }

  return { ok: true };
}
