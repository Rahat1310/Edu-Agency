import { z } from "zod";

import { documentTypes } from "@/db/schema";
import {
  DOCUMENT_MAX_BYTES,
  DOCUMENT_REJECT_NOTE_MESSAGE,
  documentMimeTypes,
} from "@/lib/documents/constants";
import {
  DOCUMENT_TYPE_KEY_MESSAGE,
  DOCUMENT_TYPE_KEY_PATTERN,
} from "@/lib/documents/type-key";

export function allowedDocumentTypes(
  extraKeys: readonly string[] = [],
): Set<string> {
  return new Set([...documentTypes, ...extraKeys]);
}

export function documentTypeSchema(extraKeys: readonly string[] = []) {
  const allowed = allowedDocumentTypes(extraKeys);

  return z
    .string()
    .trim()
    .regex(DOCUMENT_TYPE_KEY_PATTERN, DOCUMENT_TYPE_KEY_MESSAGE)
    .refine((value) => allowed.has(value), "Unknown document type");
}

export function createDocumentUploadIntentSchema(
  extraKeys: readonly string[] = [],
) {
  return z.object({
    applicationId: z.string().uuid(),
    type: documentTypeSchema(extraKeys),
    filename: z.string().trim().min(1).max(180),
    contentType: z.enum(documentMimeTypes),
    size: z
      .number()
      .int()
      .positive()
      .max(
        DOCUMENT_MAX_BYTES,
        `That file is over ${DOCUMENT_MAX_BYTES / (1024 * 1024)} MB.`,
      ),
  });
}

export const documentUploadIntentSchema = createDocumentUploadIntentSchema();

export function createDocumentCompleteSchema(
  extraKeys: readonly string[] = [],
) {
  return createDocumentUploadIntentSchema(extraKeys).extend({
    key: z.string().trim().min(1).max(500),
  });
}

export const documentCompleteSchema = createDocumentCompleteSchema();

export type DocumentUploadIntent = z.infer<
  ReturnType<typeof createDocumentUploadIntentSchema>
>;
export type DocumentCompleteInput = z.infer<
  ReturnType<typeof createDocumentCompleteSchema>
>;

export const reviewDocumentSchema = z
  .object({
    documentId: z.string().uuid(),
    leadId: z.string().uuid(),
    decision: z.enum(["approved", "rejected"]),
    reviewNote: z.string().trim().max(2000).optional(),
  })
  .refine(
    (value) =>
      value.decision === "approved" ||
      Boolean(value.reviewNote && value.reviewNote.length > 0),
    {
      path: ["reviewNote"],
      message: DOCUMENT_REJECT_NOTE_MESSAGE,
    },
  );

export type ReviewDocumentInput = z.infer<typeof reviewDocumentSchema>;
