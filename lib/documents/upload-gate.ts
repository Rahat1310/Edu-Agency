import {
  isAllowedDocumentMime,
  mimeMatchesFilename,
} from "@/lib/documents/constants";
import { sanitizeDocumentFilename } from "@/lib/documents/keys";
import { decideOwnedApplication } from "@/lib/documents/ownership";
import {
  createDocumentUploadIntentSchema,
  type DocumentUploadIntent,
} from "@/lib/schemas/document";
import { validateRequest } from "@/lib/validation-helpers";

export type UploadIntentGate =
  | { ok: true; data: DocumentUploadIntent; filename: string }
  | {
      ok: false;
      status: 400 | 401 | 403;
      message: string;
      fields?: Record<string, string[]>;
    };

/**
 * Every check that must pass before a signed PUT URL is issued.
 * Does not talk to R2 — an executable or oversize payload never reaches storage.
 */
export function gateDocumentUploadIntent(
  sessionApplicationId: string | null,
  body: unknown,
  extraTypeKeys: readonly string[] = [],
): UploadIntentGate {
  const parsed = validateRequest(
    createDocumentUploadIntentSchema(extraTypeKeys),
    body,
  );
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message:
        parsed.error.fields.size?.[0] ??
        parsed.error.fields.contentType?.[0] ??
        "That file cannot be uploaded.",
      fields: parsed.error.fields,
    };
  }

  const access = decideOwnedApplication(
    sessionApplicationId,
    parsed.data.applicationId,
  );
  if (!access.ok) {
    return access;
  }

  if (!isAllowedDocumentMime(parsed.data.contentType)) {
    return {
      ok: false,
      status: 400,
      message: "Send a PDF, JPG, or PNG — nothing else.",
    };
  }

  const filename = sanitizeDocumentFilename(
    parsed.data.filename,
    parsed.data.contentType,
  );
  if (!filename || !mimeMatchesFilename(parsed.data.contentType, filename)) {
    return {
      ok: false,
      status: 400,
      message:
        "That filename isn't allowed. Use a PDF, JPG, or PNG with a matching extension.",
    };
  }

  return { ok: true, data: parsed.data, filename };
}
