import "server-only";

import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  assessmentOutbox,
  documents,
  leadActivity,
  leads,
  messages,
  nurtureSends,
  remindersSent,
  visaApplications,
} from "@/db/schema";
import { deleteDocumentObject } from "@/lib/r2";

export async function persistLeadDeletion(leadId: string): Promise<boolean> {
  const linkedApplications = db
    .select({ id: applications.id })
    .from(applications)
    .where(eq(applications.leadId, leadId));

  // Neon batches run in a transaction. Lock the lead before removing children
  // so a concurrent note, message, or application cannot leave a partial delete.
  const [, removedDocuments, , , , , , , , removedLeads] = await db.batch([
    db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.id, leadId))
      .for("update"),
    db
      .delete(documents)
      .where(inArray(documents.applicationId, linkedApplications))
      .returning({ key: documents.r2Key }),
    db
      .delete(visaApplications)
      .where(inArray(visaApplications.applicationId, linkedApplications)),
    db
      .delete(remindersSent)
      .where(inArray(remindersSent.applicationId, linkedApplications)),
    db.delete(applications).where(eq(applications.leadId, leadId)),
    db.delete(leadActivity).where(eq(leadActivity.leadId, leadId)),
    db.delete(messages).where(eq(messages.leadId, leadId)),
    db.delete(nurtureSends).where(eq(nurtureSends.leadId, leadId)),
    db.delete(assessmentOutbox).where(eq(assessmentOutbox.leadId, leadId)),
    db.delete(leads).where(eq(leads.id, leadId)).returning({ id: leads.id }),
  ]);

  // Only remove stored files after the database transaction has committed.
  const cleanup = await Promise.allSettled(
    removedDocuments.map(({ key }) => deleteDocumentObject(key)),
  );
  cleanup.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error("[leads] Failed to remove deleted lead's document", {
        leadId,
        key: removedDocuments[index]?.key,
        error: result.reason,
      });
    }
  });

  return removedLeads.length > 0;
}
