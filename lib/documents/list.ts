import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  documents,
  type DocumentStatus,
  type DocumentType,
} from "@/db/schema";
import type { StudentDocumentRow } from "@/lib/documents/types";

export type { StudentDocumentRow };

const LIST_CAP = 100;

const documentListColumns = {
  id: documents.id,
  type: documents.type,
  filename: documents.filename,
  status: documents.status,
  reviewNote: documents.reviewNote,
  uploadedAt: documents.uploadedAt,
} as const;

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function toStudentRow(row: {
  id: string;
  type: DocumentType;
  filename: string;
  status: DocumentStatus;
  reviewNote: string | null;
  uploadedAt: Date | null;
}): StudentDocumentRow {
  return {
    ...row,
    uploadedAt: toIso(row.uploadedAt),
  };
}

export async function listDocumentsForApplication(
  applicationId: string,
): Promise<StudentDocumentRow[]> {
  const rows = await db
    .select(documentListColumns)
    .from(documents)
    .where(eq(documents.applicationId, applicationId))
    .orderBy(desc(documents.uploadedAt), desc(documents.id))
    .limit(LIST_CAP);

  return rows.map(toStudentRow);
}

export async function listDocumentsForLead(
  leadId: string,
): Promise<StudentDocumentRow[]> {
  const rows = await db
    .select(documentListColumns)
    .from(documents)
    .innerJoin(applications, eq(applications.id, documents.applicationId))
    .where(eq(applications.leadId, leadId))
    .orderBy(desc(documents.uploadedAt), desc(documents.id))
    .limit(LIST_CAP);

  return rows.map(toStudentRow);
}

export async function insertVerifiedDocument(input: {
  applicationId: string;
  type: DocumentType;
  filename: string;
  r2Key: string;
}): Promise<StudentDocumentRow> {
  const [row] = await db
    .insert(documents)
    .values({
      applicationId: input.applicationId,
      type: input.type,
      filename: input.filename,
      r2Key: input.r2Key,
      status: "pending",
    })
    .onConflictDoNothing({ target: documents.r2Key })
    .returning({
      id: documents.id,
      type: documents.type,
      filename: documents.filename,
      status: documents.status,
      reviewNote: documents.reviewNote,
      uploadedAt: documents.uploadedAt,
    });

  if (row) {
    return { ...row, uploadedAt: toIso(row.uploadedAt) };
  }

  const [existing] = await db
    .select({
      id: documents.id,
      type: documents.type,
      filename: documents.filename,
      status: documents.status,
      reviewNote: documents.reviewNote,
      uploadedAt: documents.uploadedAt,
      applicationId: documents.applicationId,
    })
    .from(documents)
    .where(eq(documents.r2Key, input.r2Key))
    .limit(1);

  if (!existing || existing.applicationId !== input.applicationId) {
    throw new Error("Document key conflict");
  }

  return {
    id: existing.id,
    type: existing.type,
    filename: existing.filename,
    status: existing.status,
    reviewNote: existing.reviewNote,
    uploadedAt: toIso(existing.uploadedAt),
  };
}

export async function getOwnedDocument(
  documentId: string,
  applicationId: string,
) {
  const [row] = await db
    .select({
      id: documents.id,
      r2Key: documents.r2Key,
      filename: documents.filename,
      type: documents.type,
    })
    .from(documents)
    .where(
      and(
        eq(documents.id, documentId),
        eq(documents.applicationId, applicationId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function getDocumentForLead(documentId: string, leadId: string) {
  const [row] = await db
    .select({
      id: documents.id,
      r2Key: documents.r2Key,
      filename: documents.filename,
      type: documents.type,
      status: documents.status,
      reviewNote: documents.reviewNote,
      uploadedAt: documents.uploadedAt,
    })
    .from(documents)
    .innerJoin(applications, eq(applications.id, documents.applicationId))
    .where(and(eq(documents.id, documentId), eq(applications.leadId, leadId)))
    .limit(1);

  return row ?? null;
}
