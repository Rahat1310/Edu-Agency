import "server-only";

import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { leads, counselorProfiles } from "@/db/schema";
import { buildAssessmentSections } from "@/lib/consultation/presentation";
import { listDocumentsForLead } from "@/lib/documents/list";
import type { StudentDocumentRow } from "@/lib/documents/types";
import { listLeadActivity } from "@/lib/leads/activity";
import type { LeadActivityItem } from "@/lib/leads/activity-types";
import type {
  LeadDetail,
  LeadListResult,
  LeadListRow,
} from "@/lib/leads/list-types";
import { listAutomationHistory, listThreadMessages } from "@/lib/messages/load";
import type {
  DeskAutomationEvent,
  DeskThreadMessage,
} from "@/lib/messages/types";
import { LEADS_PAGE_SIZE, type LeadListQuery } from "@/lib/schemas/lead";
import { getVisaPanelForLead } from "@/lib/visa-applications/load";
import type { DeskVisaApplication } from "@/lib/visa-applications/types";

export type { LeadActivityItem, LeadDetail, LeadListResult, LeadListRow };

const listColumns = {
  id: leads.id,
  name: leads.name,
  source: leads.source,
  phone: leads.phone,
  whatsapp: leads.whatsapp,
  destinationInterest: leads.destinationInterest,
  status: leads.status,
  createdAt: leads.createdAt,
} as const;

const detailColumns = {
  ...listColumns,
  email: leads.email,
  message: leads.message,
  source: leads.source,
  quizAnswers: leads.quizAnswers,
  assignedCounselorId: leads.assignedCounselorId,
  reference: leads.reference,
  assessment: leads.assessment,
  consentAt: leads.consentAt,
  consentVersion: leads.consentVersion,
} as const;

function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, "").slice(0, 120)}%`;
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function listWhere(query: LeadListQuery) {
  const filters = [];

  if (query.q) {
    const pattern = likePattern(query.q);
    filters.push(
      or(
        ilike(leads.name, pattern),
        ilike(leads.reference, pattern),
        ilike(leads.phone, pattern),
        ilike(leads.email, pattern),
      ),
    );
  }

  if (query.destinationInterest) {
    filters.push(eq(leads.destinationInterest, query.destinationInterest));
  }

  if (query.status) {
    filters.push(eq(leads.status, query.status));
  }
  if (query.source === "student-application") {
    filters.push(
      sql`exists (select 1 from applications a where a.lead_id = ${leads.id} and a.submitted_at is not null)`,
    );
  } else if (query.source) {
    filters.push(eq(leads.source, query.source));
  }

  return filters.length > 0 ? and(...filters) : undefined;
}

export async function listLeads(query: LeadListQuery): Promise<LeadListResult> {
  const where = listWhere(query);
  const offset = (query.page - 1) * LEADS_PAGE_SIZE;
  const orderBy =
    query.sort === "status"
      ? [asc(leads.status), desc(leads.createdAt)]
      : [desc(leads.createdAt)];

  const [rows, countRows] = await Promise.all([
    db
      .select(listColumns)
      .from(leads)
      .where(where)
      .orderBy(...orderBy)
      .limit(LEADS_PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(leads)
      .where(where)
      .limit(1),
  ]);

  const total = countRows[0]?.total ?? 0;

  return {
    rows: rows.map((row) => ({
      ...row,
      createdAt: toIso(row.createdAt),
    })),
    total,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE)),
    pageSize: LEADS_PAGE_SIZE,
  };
}

export type LeadPanel = {
  lead: LeadDetail;
  activity: LeadActivityItem[];
  documents: StudentDocumentRow[];
  messages: DeskThreadMessage[];
  automationHistory: DeskAutomationEvent[];
  visaApplication: DeskVisaApplication | null;
  hasLinkedApplication: boolean;
  visaLoadError: boolean;
};

export async function getLeadDetail(id: string): Promise<LeadDetail | null> {
  const [row] = await db
    .select({
      ...detailColumns,
      counselor: {
        fullName: counselorProfiles.fullName,
        title: counselorProfiles.title,
        phone: counselorProfiles.phone,
        whatsapp: counselorProfiles.whatsapp,
      },
    })
    .from(leads)
    .leftJoin(
      counselorProfiles,
      eq(counselorProfiles.id, leads.assignedCounselorId),
    )
    .where(eq(leads.id, id))
    .limit(1);

  if (!row) {
    return null;
  }

  const { assessment, consentAt, consentVersion, counselor, ...detail } = row;
  return {
    ...detail,
    createdAt: toIso(row.createdAt),
    assessmentSections: assessment
      ? buildAssessmentSections({
          assessment,
          counselor: counselor ?? undefined,
          source: row.source,
          consentAt,
          consentVersion,
        })
      : [],
  };
}

export async function getLeadPanel(id: string): Promise<LeadPanel | null> {
  const [lead, activity, documents, messages, automationHistory, visaPanel] =
    await Promise.all([
      getLeadDetail(id),
      listLeadActivity(id),
      listDocumentsForLead(id),
      listThreadMessages(id),
      listAutomationHistory(id),
      getVisaPanelForLead(id),
    ]);

  if (!lead) {
    return null;
  }

  return {
    lead,
    activity,
    documents,
    messages,
    automationHistory,
    visaApplication: visaPanel.visaApplication,
    hasLinkedApplication: visaPanel.hasLinkedApplication,
    visaLoadError: visaPanel.error,
  };
}
