import "server-only";

import { desc, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { leadActivity, leads, type LeadStatus } from "@/db/schema";
import { daysSince } from "@/lib/leads/labels";
import {
  PIPELINE_COLUMN_CAP,
  type PipelineBoardData,
  type PipelineCard,
} from "@/lib/leads/pipeline-types";

const cardColumns = {
  id: leads.id,
  name: leads.name,
  destinationInterest: leads.destinationInterest,
  status: leads.status,
  createdAt: leads.createdAt,
} as const;

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toCard(
  row: {
    id: string;
    name: string;
    destinationInterest: PipelineCard["destinationInterest"];
    status: LeadStatus;
    createdAt: Date | null;
    stageEnteredAt: Date | string | null;
  },
): PipelineCard {
  const stageEnteredAt = toIso(row.stageEnteredAt) ?? toIso(row.createdAt);

  return {
    id: row.id,
    name: row.name,
    destinationInterest: row.destinationInterest,
    status: row.status,
    stageEnteredAt,
    daysInStage: daysSince(stageEnteredAt),
  };
}

function latestStageSubquery() {
  return db
    .select({
      leadId: leadActivity.leadId,
      enteredAt: sql<Date>`max(${leadActivity.createdAt})`.as("entered_at"),
    })
    .from(leadActivity)
    .where(eq(leadActivity.type, "stage_change"))
    .groupBy(leadActivity.leadId)
    .as("latest_stage");
}

export async function listPipelineBoard(): Promise<PipelineBoardData> {
  const latestStage = latestStageSubquery();

  const [activeRows, departedRows, departedCountRows] = await Promise.all([
    db
      .select({
        ...cardColumns,
        stageEnteredAt: latestStage.enteredAt,
      })
      .from(leads)
      .leftJoin(latestStage, eq(latestStage.leadId, leads.id))
      .where(ne(leads.status, "departed"))
      .orderBy(desc(leads.createdAt)),
    db
      .select({
        ...cardColumns,
        stageEnteredAt: latestStage.enteredAt,
      })
      .from(leads)
      .leftJoin(latestStage, eq(latestStage.leadId, leads.id))
      .where(eq(leads.status, "departed"))
      .orderBy(desc(leads.createdAt))
      .limit(PIPELINE_COLUMN_CAP),
    db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(leads)
      .where(eq(leads.status, "departed"))
      .limit(1),
  ]);

  const hiddenByStatus: PipelineBoardData["hiddenByStatus"] = {};
  const cards: PipelineCard[] = [];
  const activeByStatus = new Map<LeadStatus, PipelineCard[]>();

  for (const row of activeRows) {
    const card = toCard(row);
    const bucket = activeByStatus.get(card.status) ?? [];
    bucket.push(card);
    activeByStatus.set(card.status, bucket);
  }

  for (const [status, bucket] of activeByStatus) {
    if (bucket.length > PIPELINE_COLUMN_CAP) {
      hiddenByStatus[status] = bucket.length - PIPELINE_COLUMN_CAP;
      cards.push(...bucket.slice(0, PIPELINE_COLUMN_CAP));
    } else {
      cards.push(...bucket);
    }
  }

  cards.push(...departedRows.map(toCard));

  const departedTotal = departedCountRows[0]?.total ?? 0;
  if (departedTotal > departedRows.length) {
    hiddenByStatus.departed = departedTotal - departedRows.length;
  }

  return { cards, hiddenByStatus };
}
