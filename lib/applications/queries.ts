import { sql } from "drizzle-orm";
import type { ApplicationData } from "@/lib/applications/schema";
import { applicationDocumentChecklist } from "@/lib/applications/documents";
import { applicationDocumentLabels } from "@/lib/applications/documents";
import { universityReviewLabels } from "@/lib/applications/schema";
import type { ApplicationReviewInput } from "@/lib/applications/review-schema";

// Ownership, revision, required files, stage and audit writes are checked in the same SQL statement.
export function studentApplicationSaveQuery(input: {
  applicationId: string;
  userId: string;
  revision: number;
  mode: "draft" | "submit";
  data: ApplicationData;
  requestedDocuments: string[];
}) {
  const { data } = input;
  const submit = input.mode === "submit";
  const required = applicationDocumentChecklist(data, input.requestedDocuments)
    .filter((s) => s.required)
    .map((s) => s.documentTypeKey);
  return sql`
    WITH changed AS (
      UPDATE applications a SET application_data=${JSON.stringify(data)}::jsonb,
        form_status=CASE WHEN ${submit} THEN 'submitted' ELSE a.form_status END,
        submitted_at=CASE WHEN ${submit} THEN coalesce(a.submitted_at, now()) ELSE a.submitted_at END,
        revision=a.revision+1, form_updated_at=now()
      WHERE a.id=${input.applicationId}::uuid AND a.user_id=${input.userId}::uuid AND a.revision=${input.revision}
        AND a.form_status IN ('draft','changes_requested')
        AND EXISTS (SELECT 1 FROM leads l WHERE l.id=a.lead_id
          AND (l.status IN ('new','contacted','documents') OR l.destination_interest=${data.country}))
        AND (NOT ${submit} OR NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${JSON.stringify(required)}::jsonb) AS needed(type)
          WHERE NOT EXISTS (SELECT 1 FROM documents d WHERE d.application_id=a.id AND d.type=needed.type AND d.status IN ('pending','approved'))
        ))
      RETURNING a.id, a.lead_id, a.revision
    ), lead_updated AS (
      UPDATE leads l SET name=${data.fullName}, phone=${data.phone}, destination_interest=${data.country}, updated_at=now()
      FROM changed c WHERE l.id=c.lead_id AND ${submit} RETURNING l.id
    ), submission AS (
      INSERT INTO application_submissions (application_id, revision, data, document_ids)
      SELECT c.id, c.revision, ${JSON.stringify(data)}::jsonb,
        (SELECT coalesce(jsonb_agg(d.id), '[]'::jsonb) FROM documents d WHERE d.application_id=c.id AND d.status IN ('pending','approved'))
      FROM changed c WHERE ${submit} RETURNING id
    ), audit AS (
      INSERT INTO lead_activity (lead_id, actor_user_id, type, content, is_visible_to_student)
      SELECT lead_id, ${input.userId}::uuid, 'system', 'Student submitted an application to the admissions team for review.', true
      FROM changed WHERE ${submit} RETURNING id
    ) SELECT revision FROM changed`;
}

export function applicationReviewQuery(
  data: ApplicationReviewInput,
  actorId: string,
) {
  const publicMessage = [
    universityReviewLabels[data.universityReview],
    data.proposedUniversity
      ? `Suggested / agreed university: ${data.proposedUniversity}`
      : "",
    data.universityNote,
    data.requestChanges
      ? `Changes requested: ${data.reviewMessage}`
      : data.reviewMessage,
    data.requestedDocuments.length
      ? `Requested documents: ${data.requestedDocuments.map((key) => applicationDocumentLabels[key]).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  return sql`
    WITH changed AS (
      UPDATE applications SET form_status=CASE WHEN ${data.requestChanges} THEN 'changes_requested' ELSE form_status END,
        review_message=${data.reviewMessage || null}, university_review=${data.universityReview}, proposed_university=${data.proposedUniversity || null},
        university_note=${data.universityNote || null}, requested_documents=${JSON.stringify([...new Set(data.requestedDocuments)])}::jsonb,
        revision=revision+1, form_updated_at=now()
      WHERE id=${data.id}::uuid AND revision=${data.revision} AND submitted_at IS NOT NULL
      RETURNING id, lead_id
    ), public_event AS (
      INSERT INTO lead_activity (lead_id, actor_user_id, type, content, is_visible_to_student)
      SELECT lead_id, ${actorId}::uuid, 'system', ${publicMessage}, true FROM changed RETURNING id
    ), contact_event AS (
      INSERT INTO lead_activity (lead_id, actor_user_id, type, content, is_visible_to_student)
      SELECT lead_id, ${actorId}::uuid, 'note', ${`Contact / student agreement: ${data.contactNote}`}, false FROM changed WHERE ${Boolean(data.contactNote)} RETURNING id
    ) SELECT id FROM changed`;
}

export function applicationTrackingUpdateQuery(input: {
  id: string;
  version: number;
  tracking: import("@/lib/applications/tracking").ApplicationTracking;
  actorId: string;
  message: string;
}) {
  return sql`
    WITH changed AS (
      UPDATE applications SET tracking=${JSON.stringify(input.tracking)}::jsonb,
        tracking_version=tracking_version+1, form_updated_at=now()
      WHERE id=${input.id}::uuid AND tracking_version=${input.version} AND submitted_at IS NOT NULL
      RETURNING id, lead_id
    ), audit AS (
      INSERT INTO lead_activity (lead_id, actor_user_id, type, content, is_visible_to_student)
      SELECT lead_id, ${input.actorId}::uuid, 'system', ${input.message}, true
      FROM changed RETURNING id
    ) SELECT id FROM changed`;
}
