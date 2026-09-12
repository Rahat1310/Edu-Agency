import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { applications, visaApplications } from "@/db/schema";
import { toDeskVisaApplication } from "@/lib/visa-applications/map";
import type {
  DeskVisaApplication,
  StudentVisaStatus,
} from "@/lib/visa-applications/types";

export async function getVisaPanelForLead(leadId: string): Promise<{
  visaApplication: DeskVisaApplication | null;
  hasLinkedApplication: boolean;
  error: boolean;
}> {
  try {
    return await queryVisaPanelForLead(leadId);
  } catch {
    return {
      visaApplication: null,
      hasLinkedApplication: false,
      error: true,
    };
  }
}

async function queryVisaPanelForLead(leadId: string): Promise<{
  visaApplication: DeskVisaApplication | null;
  hasLinkedApplication: boolean;
  error: boolean;
}> {
  const [row] = await db
    .select({
      applicationId: applications.id,
      id: visaApplications.id,
      destination: visaApplications.destination,
      subStatus: visaApplications.subStatus,
      referenceNumber: visaApplications.referenceNumber,
      submittedAt: visaApplications.submittedAt,
      decidedAt: visaApplications.decidedAt,
      notes: visaApplications.notes,
    })
    .from(applications)
    .leftJoin(
      visaApplications,
      eq(visaApplications.applicationId, applications.id),
    )
    .where(eq(applications.leadId, leadId))
    .limit(1);

  if (!row) {
    return {
      visaApplication: null,
      hasLinkedApplication: false,
      error: false,
    };
  }

  if (!row.id || !row.destination || !row.subStatus) {
    return {
      visaApplication: null,
      hasLinkedApplication: true,
      error: false,
    };
  }

  return {
    hasLinkedApplication: true,
    error: false,
    visaApplication: toDeskVisaApplication({
      id: row.id,
      applicationId: row.applicationId,
      destination: row.destination,
      subStatus: row.subStatus,
      referenceNumber: row.referenceNumber,
      submittedAt: row.submittedAt,
      decidedAt: row.decidedAt,
      notes: row.notes,
    }),
  };
}

export async function getStudentVisaStatus(
  applicationId: string,
): Promise<StudentVisaStatus | null> {
  const [row] = await db
    .select({
      subStatus: visaApplications.subStatus,
      referenceNumber: visaApplications.referenceNumber,
    })
    .from(visaApplications)
    .where(eq(visaApplications.applicationId, applicationId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    subStatus: row.subStatus,
    referenceNumber: row.referenceNumber,
  };
}

export async function loadStudentVisaStatus(
  applicationId: string,
): Promise<{ status: StudentVisaStatus | null; error: boolean }> {
  try {
    return {
      status: await getStudentVisaStatus(applicationId),
      error: false,
    };
  } catch {
    return { status: null, error: true };
  }
}
