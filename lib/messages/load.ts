import "server-only";

import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  leads,
  messages,
  nurtureSends,
  remindersSent,
  threadChannels,
} from "@/db/schema";
import {
  nurtureHistoryLabel,
  reminderHistoryLabel,
} from "@/lib/messages/labels";
import { sortAutomationEvents, sortThreadMessages } from "@/lib/messages/sort";
import { suggestedLeadsForMessage } from "@/lib/messages/suggestions";
import type {
  DeskAutomationEvent,
  DeskLeadMatch,
  DeskThreadMessage,
  UnmatchedMessageRow,
} from "@/lib/messages/types";
import { phoneDigitVariants } from "@/lib/phone";

const THREAD_CAP = 200;
const UNMATCHED_CAP = 100;
const AUTOMATION_CAP = 50;
const SEARCH_CAP = 8;
const PHONE_CANDIDATE_CAP = 500;

const leadMatchColumns = {
  id: leads.id,
  name: leads.name,
  phone: leads.phone,
  whatsapp: leads.whatsapp,
  status: leads.status,
  destinationInterest: leads.destinationInterest,
} as const;

function toIso(value: Date): string {
  return value.toISOString();
}

function messageBody(value: string | null): string {
  return value?.trim() ?? "";
}

function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, "").slice(0, 120)}%`;
}

function phoneOrWhatsappInSql(variants: string[]) {
  if (variants.length === 0) {
    return sql`false`;
  }

  const list = sql.join(
    variants.map((variant) => sql`${variant}`),
    sql`, `,
  );

  return sql`(
    regexp_replace(coalesce(${leads.phone}, ''), '[^0-9]', '', 'g') in (${list})
    or regexp_replace(coalesce(${leads.whatsapp}, ''), '[^0-9]', '', 'g') in (${list})
  )`;
}

export async function listThreadMessages(
  leadId: string,
): Promise<DeskThreadMessage[]> {
  const rows = await db
    .select({
      id: messages.id,
      channel: messages.channel,
      direction: messages.direction,
      body: messages.body,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      and(
        eq(messages.leadId, leadId),
        inArray(messages.channel, [...threadChannels]),
      ),
    )
    .orderBy(asc(messages.createdAt), asc(messages.id))
    .limit(THREAD_CAP);

  const mapped: DeskThreadMessage[] = [];

  for (const row of rows) {
    if (row.channel !== "whatsapp" && row.channel !== "messenger") {
      continue;
    }

    mapped.push({
      id: row.id,
      channel: row.channel,
      direction: row.direction,
      body: messageBody(row.body),
      createdAt: toIso(row.createdAt),
    });
  }

  return sortThreadMessages(mapped);
}

export async function listAutomationHistory(
  leadId: string,
): Promise<DeskAutomationEvent[]> {
  const [nurtureRows, reminderRows] = await Promise.all([
    db
      .select({
        id: nurtureSends.id,
        stepId: nurtureSends.stepId,
        channel: nurtureSends.channel,
        sentAt: nurtureSends.sentAt,
      })
      .from(nurtureSends)
      .where(eq(nurtureSends.leadId, leadId))
      .orderBy(desc(nurtureSends.sentAt))
      .limit(AUTOMATION_CAP),
    db
      .select({
        id: remindersSent.id,
        window: remindersSent.window,
        sentAt: remindersSent.sentAt,
      })
      .from(remindersSent)
      .innerJoin(applications, eq(applications.id, remindersSent.applicationId))
      .where(eq(applications.leadId, leadId))
      .orderBy(desc(remindersSent.sentAt))
      .limit(AUTOMATION_CAP),
  ]);

  const events: DeskAutomationEvent[] = [
    ...nurtureRows.map((row) => ({
      id: row.id,
      kind: "nurture" as const,
      label: nurtureHistoryLabel(row.stepId, row.channel),
      sentAt: toIso(row.sentAt),
    })),
    ...reminderRows.map((row) => ({
      id: row.id,
      kind: "reminder" as const,
      label: reminderHistoryLabel(row.window),
      sentAt: toIso(row.sentAt),
    })),
  ];

  return sortAutomationEvents(events).slice(-AUTOMATION_CAP);
}

export async function listUnmatchedMessages(): Promise<UnmatchedMessageRow[]> {
  const rows = await db
    .select({
      id: messages.id,
      channel: messages.channel,
      direction: messages.direction,
      body: messages.body,
      createdAt: messages.createdAt,
      externalSenderId: messages.externalSenderId,
    })
    .from(messages)
    .where(
      and(
        isNull(messages.leadId),
        inArray(messages.channel, [...threadChannels]),
      ),
    )
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(UNMATCHED_CAP);

  const unmatched: Omit<UnmatchedMessageRow, "suggestedLeads">[] = [];

  for (const row of rows) {
    if (row.channel !== "whatsapp" && row.channel !== "messenger") {
      continue;
    }

    unmatched.push({
      id: row.id,
      channel: row.channel,
      direction: row.direction,
      body: messageBody(row.body),
      createdAt: toIso(row.createdAt),
      externalSenderId: row.externalSenderId,
    });
  }

  const senderVariants = [
    ...new Set(
      unmatched.flatMap((row) =>
        row.channel === "whatsapp" && row.externalSenderId
          ? phoneDigitVariants(row.externalSenderId)
          : [],
      ),
    ),
  ];

  const candidates =
    senderVariants.length > 0
      ? await db
          .select(leadMatchColumns)
          .from(leads)
          .where(phoneOrWhatsappInSql(senderVariants))
          .limit(PHONE_CANDIDATE_CAP)
      : [];

  return unmatched.map((row) => ({
    ...row,
    suggestedLeads: suggestedLeadsForMessage(row, candidates),
  }));
}

export async function searchLeadsForMessageLink(
  query: string,
): Promise<DeskLeadMatch[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const pattern = likePattern(trimmed);

  return db
    .select(leadMatchColumns)
    .from(leads)
    .where(
      or(
        ilike(leads.name, pattern),
        ilike(leads.phone, pattern),
        ilike(leads.email, pattern),
        ilike(leads.whatsapp, pattern),
      ),
    )
    .orderBy(desc(leads.createdAt))
    .limit(SEARCH_CAP);
}
