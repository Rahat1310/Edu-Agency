import "server-only";

import { and, eq, inArray, like, lte, max, ne, not, or } from "drizzle-orm";

import { db } from "@/db";
import {
  leadActivity,
  leads,
  messages,
  nurtureSends,
  type LeadStatus,
} from "@/db/schema";
import type { NurtureCandidate } from "@/lib/nurture/match";
import {
  NURTURE_ACTIVITY_PREFIX,
  NURTURE_ELIGIBLE_STATUSES,
} from "@/lib/nurture/sequence";

const BATCH_CAP = 250;

function trimToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function loadNurtureCandidates(
  cutoff: Date,
): Promise<NurtureCandidate[]> {
  const leadRows = await db
    .select({
      leadId: leads.id,
      name: leads.name,
      email: leads.email,
      phone: leads.phone,
      whatsapp: leads.whatsapp,
      destinationInterest: leads.destinationInterest,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(
      and(
        inArray(leads.status, [...NURTURE_ELIGIBLE_STATUSES]),
        lte(leads.createdAt, cutoff),
      ),
    )
    .orderBy(leads.createdAt)
    .limit(BATCH_CAP);

  if (leadRows.length === 0) {
    return [];
  }

  const leadIds = leadRows.map((row) => row.leadId);

  const [activityRows, inboundRows, sentRows] = await Promise.all([
    db
      .select({
        leadId: leadActivity.leadId,
        lastAt: max(leadActivity.createdAt),
      })
      .from(leadActivity)
      .where(
        and(
          inArray(leadActivity.leadId, leadIds),
          or(
            ne(leadActivity.type, "system"),
            not(like(leadActivity.content, `${NURTURE_ACTIVITY_PREFIX}%`)),
          ),
        ),
      )
      .groupBy(leadActivity.leadId),
    db
      .select({
        leadId: messages.leadId,
        lastAt: max(messages.createdAt),
      })
      .from(messages)
      .where(
        and(
          inArray(messages.leadId, leadIds),
          eq(messages.direction, "inbound"),
        ),
      )
      .groupBy(messages.leadId),
    db
      .select({
        leadId: nurtureSends.leadId,
        stepId: nurtureSends.stepId,
      })
      .from(nurtureSends)
      .where(inArray(nurtureSends.leadId, leadIds)),
  ]);

  const lastActivity = new Map(
    activityRows.map((row) => [row.leadId, row.lastAt]),
  );
  const lastInbound = new Map(
    inboundRows.flatMap((row) =>
      row.leadId ? ([[row.leadId, row.lastAt]] as const) : [],
    ),
  );
  const sentByLead = new Map<string, string[]>();

  for (const row of sentRows) {
    const list = sentByLead.get(row.leadId) ?? [];
    list.push(row.stepId);
    sentByLead.set(row.leadId, list);
  }

  return leadRows.map((row) => {
    const createdAt = row.createdAt ?? cutoff;
    const activityAt = lastActivity.get(row.leadId);
    const lastContactAt =
      activityAt && activityAt > createdAt ? activityAt : createdAt;

    return {
      leadId: row.leadId,
      name: row.name,
      email: trimToNull(row.email),
      phone: row.phone,
      whatsapp: trimToNull(row.whatsapp),
      destinationInterest: row.destinationInterest,
      status: row.status,
      lastContactAt,
      lastInboundAt: lastInbound.get(row.leadId) ?? null,
      sentStepIds: sentByLead.get(row.leadId) ?? [],
    };
  });
}

export async function loadLiveNurtureState(
  leadIds: readonly string[],
): Promise<{
  statusByLead: Map<string, LeadStatus>;
  inboundLeadIds: Set<string>;
  sentKeys: Set<string>;
}> {
  if (leadIds.length === 0) {
    return {
      statusByLead: new Map(),
      inboundLeadIds: new Set(),
      sentKeys: new Set(),
    };
  }

  const ids = [...leadIds];

  const [statusRows, inboundRows, sentRows] = await Promise.all([
    db
      .select({ id: leads.id, status: leads.status })
      .from(leads)
      .where(inArray(leads.id, ids)),
    db
      .selectDistinct({ leadId: messages.leadId })
      .from(messages)
      .where(
        and(inArray(messages.leadId, ids), eq(messages.direction, "inbound")),
      ),
    db
      .select({
        leadId: nurtureSends.leadId,
        stepId: nurtureSends.stepId,
      })
      .from(nurtureSends)
      .where(inArray(nurtureSends.leadId, ids)),
  ]);

  return {
    statusByLead: new Map(statusRows.map((row) => [row.id, row.status])),
    inboundLeadIds: new Set(
      inboundRows.flatMap((row) => (row.leadId ? [row.leadId] : [])),
    ),
    sentKeys: new Set(sentRows.map((row) => `${row.leadId}:${row.stepId}`)),
  };
}

export async function recordNurtureSend(input: {
  leadId: string;
  stepId: string;
  channel: "whatsapp" | "email";
  actorUserId: string;
  activityContent: string;
  messageBody: string;
}): Promise<void> {
  await db
    .insert(nurtureSends)
    .values({
      leadId: input.leadId,
      stepId: input.stepId,
      channel: input.channel,
    })
    .onConflictDoNothing({
      target: [nurtureSends.leadId, nurtureSends.stepId],
    });

  await db.insert(leadActivity).values({
    leadId: input.leadId,
    actorUserId: input.actorUserId,
    type: "system",
    content: input.activityContent,
    fromStatus: null,
    toStatus: null,
    isVisibleToStudent: false,
  });

  await db.insert(messages).values({
    leadId: input.leadId,
    direction: "outbound",
    channel: input.channel,
    body: input.messageBody,
  });
}
