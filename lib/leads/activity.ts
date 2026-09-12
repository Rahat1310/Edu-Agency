import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { leadActivity, leads, users } from "@/db/schema";
import type {
  LeadActivityItem,
  StudentActivityItem,
} from "@/lib/leads/activity-types";

const ACTIVITY_CAP = 500;
const STUDENT_FEED_CAP = 30;

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function actorLabel(name: string | null, email: string): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : email;
}

function studentFacingName(name: string | null): string {
  const first = name?.trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : "Your counselor";
}

export async function listLeadActivity(
  leadId: string,
): Promise<LeadActivityItem[]> {
  const rows = await db
    .select({
      id: leadActivity.id,
      type: leadActivity.type,
      content: leadActivity.content,
      fromStatus: leadActivity.fromStatus,
      toStatus: leadActivity.toStatus,
      createdAt: leadActivity.createdAt,
      isVisibleToStudent: leadActivity.isVisibleToStudent,
      actorName: users.fullName,
      actorEmail: users.email,
    })
    .from(leadActivity)
    .innerJoin(users, eq(users.id, leadActivity.actorUserId))
    .where(eq(leadActivity.leadId, leadId))
    .orderBy(asc(leadActivity.createdAt), asc(leadActivity.id))
    .limit(ACTIVITY_CAP);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    content: row.content,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    createdAt: toIso(row.createdAt),
    actorLabel: actorLabel(row.actorName, row.actorEmail),
    isVisibleToStudent: row.isVisibleToStudent,
  }));
}

export async function listStudentVisibleActivity(
  leadId: string,
): Promise<StudentActivityItem[]> {
  const rows = await db
    .select({
      id: leadActivity.id,
      type: leadActivity.type,
      content: leadActivity.content,
      toStatus: leadActivity.toStatus,
      createdAt: leadActivity.createdAt,
      actorName: users.fullName,
    })
    .from(leadActivity)
    .innerJoin(users, eq(users.id, leadActivity.actorUserId))
    .where(
      and(
        eq(leadActivity.leadId, leadId),
        eq(leadActivity.isVisibleToStudent, true),
      ),
    )
    .orderBy(desc(leadActivity.createdAt), desc(leadActivity.id))
    .limit(STUDENT_FEED_CAP);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    content: row.content,
    toStatus: row.toStatus,
    createdAt: toIso(row.createdAt),
    fromName: studentFacingName(row.actorName),
  }));
}

export async function insertLeadNote(input: {
  leadId: string;
  content: string;
  actorUserId: string;
  actorLabel: string;
  isVisibleToStudent?: boolean;
}): Promise<LeadActivityItem | null> {
  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(eq(leads.id, input.leadId))
    .limit(1);

  if (!lead) {
    return null;
  }

  const isVisibleToStudent = input.isVisibleToStudent === true;

  const [row] = await db
    .insert(leadActivity)
    .values({
      leadId: input.leadId,
      actorUserId: input.actorUserId,
      type: "note",
      content: input.content,
      fromStatus: null,
      toStatus: null,
      isVisibleToStudent,
    })
    .returning({
      id: leadActivity.id,
      type: leadActivity.type,
      content: leadActivity.content,
      fromStatus: leadActivity.fromStatus,
      toStatus: leadActivity.toStatus,
      createdAt: leadActivity.createdAt,
      isVisibleToStudent: leadActivity.isVisibleToStudent,
    });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    type: row.type,
    content: row.content,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    createdAt: toIso(row.createdAt),
    actorLabel: input.actorLabel,
    isVisibleToStudent: row.isVisibleToStudent,
  };
}

/** Document review and similar events — always lands on the student dashboard. */
export async function insertStudentVisibleSystemEvent(input: {
  leadId: string;
  content: string;
  actorUserId: string;
  actorLabel: string;
}): Promise<LeadActivityItem | null> {
  return insertLeadSystemEvent({
    ...input,
    isVisibleToStudent: true,
  });
}

export async function insertLeadSystemEvent(input: {
  leadId: string;
  content: string;
  actorUserId: string;
  actorLabel: string;
  isVisibleToStudent?: boolean;
}): Promise<LeadActivityItem | null> {
  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(eq(leads.id, input.leadId))
    .limit(1);

  if (!lead) {
    return null;
  }

  const isVisibleToStudent = input.isVisibleToStudent === true;

  const [row] = await db
    .insert(leadActivity)
    .values({
      leadId: input.leadId,
      actorUserId: input.actorUserId,
      type: "system",
      content: input.content,
      fromStatus: null,
      toStatus: null,
      isVisibleToStudent,
    })
    .returning({
      id: leadActivity.id,
      type: leadActivity.type,
      content: leadActivity.content,
      fromStatus: leadActivity.fromStatus,
      toStatus: leadActivity.toStatus,
      createdAt: leadActivity.createdAt,
      isVisibleToStudent: leadActivity.isVisibleToStudent,
    });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    type: row.type,
    content: row.content,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    createdAt: toIso(row.createdAt),
    actorLabel: input.actorLabel,
    isVisibleToStudent: row.isVisibleToStudent,
  };
}
