import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { applications, visaApplications } from "@/db/schema";
import { insertLeadSystemEvent } from "@/lib/leads/activity";
import type { LeadActivityItem } from "@/lib/leads/activity-types";
import { visaApplicationAuditLine } from "@/lib/visa-applications/copy";
import { toDeskVisaApplication } from "@/lib/visa-applications/map";
import type { DeskVisaApplication } from "@/lib/visa-applications/types";
import type { UpdateVisaApplicationInput } from "@/lib/schemas/visa-application";

export type PersistVisaApplicationResult =
  | {
      ok: true;
      visa: DeskVisaApplication;
      activity: LeadActivityItem | null;
    }
  | { ok: false; message: string };

function sameInstant(left: Date | null, right: Date | null): boolean {
  if (!left && !right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  return left.getTime() === right.getTime();
}

export async function persistVisaApplicationUpdate(input: {
  leadId: string;
  actorUserId: string;
  actorLabel: string;
  patch: UpdateVisaApplicationInput;
}): Promise<PersistVisaApplicationResult> {
  const [existing] = await db
    .select({
      id: visaApplications.id,
      applicationId: visaApplications.applicationId,
      destination: visaApplications.destination,
      subStatus: visaApplications.subStatus,
      referenceNumber: visaApplications.referenceNumber,
      submittedAt: visaApplications.submittedAt,
      decidedAt: visaApplications.decidedAt,
      notes: visaApplications.notes,
    })
    .from(visaApplications)
    .innerJoin(
      applications,
      eq(applications.id, visaApplications.applicationId),
    )
    .where(eq(applications.leadId, input.leadId))
    .limit(1);

  if (!existing) {
    return {
      ok: false,
      message:
        "This lead has no visa file yet. Move the card to Visa after the student account is linked.",
    };
  }

  const nextReference = input.patch.referenceNumber;
  const nextNotes = input.patch.notes;
  const subStatusChanged = existing.subStatus !== input.patch.subStatus;
  const referenceChanged =
    (existing.referenceNumber ?? "") !== (nextReference ?? "");
  const datesChanged =
    !sameInstant(existing.submittedAt, input.patch.submittedAt) ||
    !sameInstant(existing.decidedAt, input.patch.decidedAt);
  const notesChanged = (existing.notes ?? "") !== (nextNotes ?? "");

  if (
    !subStatusChanged &&
    !referenceChanged &&
    !datesChanged &&
    !notesChanged
  ) {
    return {
      ok: true,
      visa: toDeskVisaApplication(existing),
      activity: null,
    };
  }

  const [updated] = await db
    .update(visaApplications)
    .set({
      subStatus: input.patch.subStatus,
      referenceNumber: nextReference,
      submittedAt: input.patch.submittedAt,
      decidedAt: input.patch.decidedAt,
      notes: nextNotes,
    })
    .where(eq(visaApplications.id, existing.id))
    .returning({
      id: visaApplications.id,
      applicationId: visaApplications.applicationId,
      destination: visaApplications.destination,
      subStatus: visaApplications.subStatus,
      referenceNumber: visaApplications.referenceNumber,
      submittedAt: visaApplications.submittedAt,
      decidedAt: visaApplications.decidedAt,
      notes: visaApplications.notes,
    });

  if (!updated) {
    return {
      ok: false,
      message: "The visa file could not be updated. Try again.",
    };
  }

  const isVisibleToStudent = subStatusChanged || referenceChanged;
  const content = visaApplicationAuditLine({
    subStatus: updated.subStatus,
    referenceNumber: updated.referenceNumber,
    subStatusChanged,
    referenceChanged,
    datesChanged,
    notesChanged,
  });

  try {
    const activity = await insertLeadSystemEvent({
      leadId: input.leadId,
      content,
      actorUserId: input.actorUserId,
      actorLabel: input.actorLabel,
      isVisibleToStudent,
    });

    if (!activity) {
      throw new Error("activity missing");
    }

    return {
      ok: true,
      visa: toDeskVisaApplication(updated),
      activity,
    };
  } catch {
    await db
      .update(visaApplications)
      .set({
        subStatus: existing.subStatus,
        referenceNumber: existing.referenceNumber,
        submittedAt: existing.submittedAt,
        decidedAt: existing.decidedAt,
        notes: existing.notes,
      })
      .where(eq(visaApplications.id, existing.id));

    return {
      ok: false,
      message: "The visa update could not be recorded. Nothing was changed.",
    };
  }
}
