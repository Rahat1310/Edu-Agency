import "server-only";
import { z } from "zod";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  applications,
  applicationSubmissions,
  leads,
  users,
} from "@/db/schema";
import {
  applicationDataSchema,
  emptyApplicationData,
  formStatuses,
} from "@/lib/applications/schema";

export async function loadApplicationCase(id: string) {
  const [row] = await db
    .select({
      ...getTableColumns(applications),
      name: leads.name,
      phone: leads.phone,
      email: users.email,
      source: leads.source,
      stage: leads.status,
      destination: leads.destinationInterest,
    })
    .from(applications)
    .innerJoin(leads, eq(applications.leadId, leads.id))
    .innerJoin(users, eq(applications.userId, users.id))
    .where(eq(applications.id, id))
    .limit(1);
  if (!row) return null;
  const data = applicationDataSchema.safeParse(row.applicationData);
  return {
    id: row.id,
    leadId: row.leadId,
    userId: row.userId,
    name: row.name,
    phone: row.phone,
    email: row.email,
    source: row.source,
    stage: row.stage,
    destination: row.destination,
    data: data.success ? data.data : emptyApplicationData(),
    hasSavedData: data.success,
    formStatus: row.formStatus,
    revision: row.revision,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    updatedAt: row.formUpdatedAt.toISOString(),
    requestedDocuments: row.requestedDocuments,
    reviewMessage: row.reviewMessage,
    universityReview: row.universityReview,
    proposedUniversity: row.proposedUniversity,
    universityNote: row.universityNote,
  };
}
export type ApplicationCase = NonNullable<
  Awaited<ReturnType<typeof loadApplicationCase>>
>;
export function listApplicationSubmissions(id: string) {
  return db
    .select()
    .from(applicationSubmissions)
    .where(eq(applicationSubmissions.applicationId, id))
    .orderBy(desc(applicationSubmissions.revision))
    .limit(50);
}

export async function listApplicationCases(input: {
  q?: string;
  status?: string;
  lead?: string;
  page?: string;
}) {
  const conditions = [];
  const q = (input.q ?? "")
    .trim()
    .slice(0, 120)
    .replace(/[\\%_]/g, "");
  if (q)
    conditions.push(
      or(
        ilike(leads.name, `%${q}%`),
        ilike(leads.email, `%${q}%`),
        ilike(leads.phone, `%${q}%`),
        sql`${applications.applicationData}->>'preferredUniversity' ILIKE ${`%${q}%`}`,
      ),
    );
  if (formStatuses.some((s) => s === input.status))
    conditions.push(
      eq(
        applications.formStatus,
        input.status as (typeof formStatuses)[number],
      ),
    );
  if (input.lead && z.uuid().safeParse(input.lead).success)
    conditions.push(eq(applications.leadId, input.lead));
  const where = and(...conditions);
  const page = Math.min(
    100000,
    Math.max(1, Number.parseInt(input.page ?? "1", 10) || 1),
  );
  const [rows, counts] = await Promise.all([
    db
      .select({
        id: applications.id,
        leadId: applications.leadId,
        name: leads.name,
        formStatus: applications.formStatus,
        stage: leads.status,
        data: applications.applicationData,
        submittedAt: applications.submittedAt,
        updatedAt: applications.formUpdatedAt,
      })
      .from(applications)
      .innerJoin(leads, eq(applications.leadId, leads.id))
      .where(where)
      .orderBy(desc(applications.formUpdatedAt), desc(applications.id))
      .limit(25)
      .offset((page - 1) * 25),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .innerJoin(leads, eq(applications.leadId, leads.id))
      .where(where),
  ]);
  const total = counts[0]?.count ?? 0;
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / 25)) };
}
