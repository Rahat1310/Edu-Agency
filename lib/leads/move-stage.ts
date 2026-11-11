import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import type { LeadStatus } from "@/db/schema";
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

  try {
    const moved = await db.execute(sql`
      WITH changed AS (
        UPDATE leads SET status=${input.toStatus}, updated_at=now()
        WHERE id=${input.leadId}::uuid AND status=${input.fromStatus}
        RETURNING id
      )
      INSERT INTO lead_activity (lead_id, actor_user_id, type, from_status, to_status, is_visible_to_student)
      SELECT id, ${input.actorUserId}::uuid, 'stage_change', ${input.fromStatus}, ${input.toStatus}, true
      FROM changed RETURNING id`);
    if (!moved.rows.length)
      return {
        ok: false,
        message:
          "This lead was already moved or no longer exists. Refresh the board and try again.",
      };
  } catch {
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
