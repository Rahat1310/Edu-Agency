import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { applications, leads, visaApplications } from "@/db/schema";
import { toDeskVisaApplication } from "@/lib/visa-applications/map";
import { isVisaPipelineStage } from "@/lib/visa-applications/stage";
import type { DeskVisaApplication } from "@/lib/visa-applications/types";

export async function ensureVisaApplicationForLead(
  leadId: string,
): Promise<DeskVisaApplication | null> {
  const [linked] = await db
    .select({
      applicationId: applications.id,
      destination: leads.destinationInterest,
      status: leads.status,
    })
    .from(applications)
    .innerJoin(leads, eq(leads.id, applications.leadId))
    .where(eq(applications.leadId, leadId))
    .limit(1);

  if (!linked || !isVisaPipelineStage(linked.status)) {
    return null;
  }

  const [inserted] = await db
    .insert(visaApplications)
    .values({
      applicationId: linked.applicationId,
      destination: linked.destination,
      subStatus: "preparing_documents",
    })
    .onConflictDoNothing({ target: visaApplications.applicationId })
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

  if (inserted) {
    return toDeskVisaApplication(inserted);
  }

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
    .where(eq(visaApplications.applicationId, linked.applicationId))
    .limit(1);

  return existing ? toDeskVisaApplication(existing) : null;
}
