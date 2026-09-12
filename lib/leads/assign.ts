import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { insertLeadSystemEvent } from "@/lib/leads/activity";
import type { LeadActivityItem } from "@/lib/leads/activity-types";
import { getAssignableCounselor } from "@/lib/leads/counselors";

export type PersistLeadAssignmentResult =
  | {
      ok: true;
      assignedCounselorId: string | null;
      activity: LeadActivityItem | null;
    }
  | { ok: false; message: string };

export async function persistLeadAssignment(input: {
  leadId: string;
  counselorId: string | "";
  actorUserId: string;
  actorLabel: string;
}): Promise<PersistLeadAssignmentResult> {
  const nextId = input.counselorId === "" ? null : input.counselorId;

  let nextLabel: string | null = null;
  if (nextId) {
    const counselor = await getAssignableCounselor(nextId);
    if (!counselor) {
      return {
        ok: false,
        message:
          "That counselor is not on the desk, so the file was not reassigned.",
      };
    }
    nextLabel = counselor.label;
  }

  const [lead] = await db
    .select({
      id: leads.id,
      assignedCounselorId: leads.assignedCounselorId,
    })
    .from(leads)
    .where(eq(leads.id, input.leadId))
    .limit(1);

  if (!lead) {
    return { ok: false, message: "This lead no longer exists." };
  }

  if (lead.assignedCounselorId === nextId) {
    return {
      ok: true,
      assignedCounselorId: nextId,
      activity: null,
    };
  }

  const [updated] = await db
    .update(leads)
    .set({ assignedCounselorId: nextId })
    .where(eq(leads.id, input.leadId))
    .returning({
      id: leads.id,
      assignedCounselorId: leads.assignedCounselorId,
    });

  if (!updated) {
    return { ok: false, message: "This lead no longer exists." };
  }

  const content = nextLabel
    ? `Assigned to ${nextLabel}.`
    : "Unassigned. This file no longer counts on a counselor's performance stats.";

  const activity = await insertLeadSystemEvent({
    leadId: input.leadId,
    content,
    actorUserId: input.actorUserId,
    actorLabel: input.actorLabel,
    isVisibleToStudent: false,
  });

  return {
    ok: true,
    assignedCounselorId: updated.assignedCounselorId,
    activity,
  };
}
