"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardAccess } from "@/lib/auth-helpers";
import { DOCUMENT_REJECT_NOTE_MESSAGE } from "@/lib/documents/constants";
import { persistDocumentReview } from "@/lib/documents/review";
import type { StudentDocumentRow } from "@/lib/documents/types";
import { persistLeadAssignment } from "@/lib/leads/assign";
import { insertLeadNote } from "@/lib/leads/activity";
import type { LeadActivityItem } from "@/lib/leads/activity-types";
import { reviewDocumentSchema } from "@/lib/schemas/document";
import {
  addLeadNoteSchema,
  assignLeadCounselorSchema,
} from "@/lib/schemas/lead";
import {
  updateVisaApplicationSchema,
  visaApplicationLeadIdSchema,
} from "@/lib/schemas/visa-application";
import { validateRequest } from "@/lib/validation-helpers";
import { ensureVisaApplicationForLead } from "@/lib/visa-applications/ensure";
import type { DeskVisaApplication } from "@/lib/visa-applications/types";
import { persistVisaApplicationUpdate } from "@/lib/visa-applications/update";

export type AddLeadNoteResult =
  { ok: true; activity: LeadActivityItem } | { ok: false; message: string };

export async function addLeadNote(input: unknown): Promise<AddLeadNoteResult> {
  const user = await requireDashboardAccess();
  const parsed = validateRequest(addLeadNoteSchema, input);

  if (!parsed.success) {
    return { ok: false, message: "Write a note before saving." };
  }

  const actorLabel = user.fullName?.trim() || user.email;
  const activity = await insertLeadNote({
    leadId: parsed.data.leadId,
    content: parsed.data.content,
    actorUserId: user.id,
    actorLabel,
    isVisibleToStudent: parsed.data.isVisibleToStudent,
  });

  if (!activity) {
    return {
      ok: false,
      message: "This lead no longer exists, so the note was not saved.",
    };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin/pipeline");
  revalidatePath("/portal");

  return { ok: true, activity };
}

export type ReviewLeadDocumentResult =
  | {
      ok: true;
      document: StudentDocumentRow;
      activity: LeadActivityItem | null;
    }
  | { ok: false; message: string; field?: "reviewNote" };

export async function reviewLeadDocument(
  input: unknown,
): Promise<ReviewLeadDocumentResult> {
  const user = await requireDashboardAccess();
  const parsed = validateRequest(reviewDocumentSchema, input);

  if (!parsed.success) {
    const noteError = parsed.error.fields.reviewNote?.[0];
    return {
      ok: false,
      message: noteError ?? "That review could not be saved.",
      field: noteError ? "reviewNote" : undefined,
    };
  }

  const actorLabel = user.fullName?.trim() || user.email;
  const result = await persistDocumentReview({
    documentId: parsed.data.documentId,
    leadId: parsed.data.leadId,
    decision: parsed.data.decision,
    reviewNote: parsed.data.reviewNote,
    actorUserId: user.id,
    actorLabel,
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.message,
      field:
        result.message === DOCUMENT_REJECT_NOTE_MESSAGE
          ? "reviewNote"
          : undefined,
    };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin/pipeline");
  revalidatePath("/portal");
  revalidatePath("/portal/documents");

  return result;
}

function revalidateVisaDesk() {
  revalidatePath("/admin/leads");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/performance");
  revalidatePath("/portal");
}

export type UpdateLeadVisaResult =
  | {
      ok: true;
      visa: DeskVisaApplication;
      activity: LeadActivityItem | null;
    }
  | { ok: false; message: string };

export async function updateLeadVisaApplication(
  input: unknown,
): Promise<UpdateLeadVisaResult> {
  const user = await requireDashboardAccess();
  const parsed = validateRequest(updateVisaApplicationSchema, input);

  if (!parsed.success) {
    const firstField = Object.values(parsed.error.fields)[0]?.[0];
    return {
      ok: false,
      message: firstField ?? "That visa update is not valid.",
    };
  }

  const actorLabel = user.fullName?.trim() || user.email;
  const result = await persistVisaApplicationUpdate({
    leadId: parsed.data.leadId,
    actorUserId: user.id,
    actorLabel,
    patch: parsed.data,
  });

  if (!result.ok) {
    return result;
  }

  revalidateVisaDesk();
  return result;
}

export async function createLeadVisaApplication(
  input: unknown,
): Promise<UpdateLeadVisaResult> {
  await requireDashboardAccess();
  const parsed = validateRequest(visaApplicationLeadIdSchema, input);

  if (!parsed.success) {
    return { ok: false, message: "That lead could not be found." };
  }

  const visa = await ensureVisaApplicationForLead(parsed.data.leadId);

  if (!visa) {
    return {
      ok: false,
      message:
        "Link a student account first, then move the card to Visa. The visa file is created from that stage change.",
    };
  }

  revalidateVisaDesk();
  return { ok: true, visa, activity: null };
}

export type AssignLeadCounselorResult =
  | {
      ok: true;
      assignedCounselorId: string | null;
      activity: LeadActivityItem | null;
    }
  | { ok: false; message: string };

export async function assignLeadCounselor(
  input: unknown,
): Promise<AssignLeadCounselorResult> {
  const user = await requireDashboardAccess();
  const parsed = validateRequest(assignLeadCounselorSchema, input);

  if (!parsed.success) {
    return { ok: false, message: "That assignment is not valid." };
  }

  const actorLabel = user.fullName?.trim() || user.email;
  const result = await persistLeadAssignment({
    leadId: parsed.data.leadId,
    counselorId: parsed.data.counselorId,
    actorUserId: user.id,
    actorLabel,
  });

  if (!result.ok) {
    return result;
  }

  revalidateVisaDesk();
  return result;
}
