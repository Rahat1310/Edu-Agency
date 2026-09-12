import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { documents } from "@/db/schema";
import { DOCUMENT_REJECT_NOTE_MESSAGE } from "@/lib/documents/constants";
import { getDocumentForLead } from "@/lib/documents/list";
import { documentReviewActivityContent } from "@/lib/documents/review-copy";
import type { StudentDocumentRow } from "@/lib/documents/types";
import { insertStudentVisibleSystemEvent } from "@/lib/leads/activity";
import type { LeadActivityItem } from "@/lib/leads/activity-types";

export type DocumentReviewResult =
  | {
      ok: true;
      document: StudentDocumentRow;
      activity: LeadActivityItem | null;
    }
  | { ok: false; message: string };

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export async function persistDocumentReview(input: {
  documentId: string;
  leadId: string;
  decision: "approved" | "rejected";
  reviewNote: string | undefined;
  actorUserId: string;
  actorLabel: string;
}): Promise<DocumentReviewResult> {
  const existing = await getDocumentForLead(input.documentId, input.leadId);

  if (!existing) {
    return {
      ok: false,
      message: "That file is not on this lead.",
    };
  }

  const nextStatus = input.decision;
  const nextNote =
    input.decision === "rejected" ? (input.reviewNote?.trim() ?? "") : null;

  if (input.decision === "rejected" && !nextNote) {
    return {
      ok: false,
      message: DOCUMENT_REJECT_NOTE_MESSAGE,
    };
  }

  const previousStatus = existing.status;
  const previousNote = existing.reviewNote;

  if (
    previousStatus === nextStatus &&
    (previousNote ?? "") === (nextNote ?? "")
  ) {
    return {
      ok: true,
      document: {
        id: existing.id,
        type: existing.type,
        filename: existing.filename,
        status: existing.status,
        reviewNote: existing.reviewNote,
        uploadedAt: toIso(existing.uploadedAt),
      },
      activity: null,
    };
  }

  const [updated] = await db
    .update(documents)
    .set({
      status: nextStatus,
      reviewNote: nextNote,
    })
    .where(eq(documents.id, existing.id))
    .returning({
      id: documents.id,
      type: documents.type,
      filename: documents.filename,
      status: documents.status,
      reviewNote: documents.reviewNote,
      uploadedAt: documents.uploadedAt,
    });

  if (!updated) {
    return {
      ok: false,
      message: "That file could not be updated. Try again.",
    };
  }

  const content = documentReviewActivityContent({
    decision: input.decision,
    type: updated.type,
    filename: updated.filename,
    reviewNote: updated.reviewNote,
  });

  try {
    const activity = await insertStudentVisibleSystemEvent({
      leadId: input.leadId,
      content,
      actorUserId: input.actorUserId,
      actorLabel: input.actorLabel,
    });

    if (!activity) {
      throw new Error("activity missing");
    }

    return {
      ok: true,
      document: {
        ...updated,
        uploadedAt: toIso(updated.uploadedAt),
      },
      activity,
    };
  } catch {
    await db
      .update(documents)
      .set({
        status: previousStatus,
        reviewNote: previousNote,
      })
      .where(eq(documents.id, existing.id));

    return {
      ok: false,
      message: "The review could not be recorded. The file was not changed.",
    };
  }
}
