import {
  documentStatuses,
  documentTypes,
  type DocumentStatus,
  type DocumentType,
  type GeneralDocumentType,
} from "@/db/schema";

export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export const DOCUMENT_UPLOAD_EXPIRES_SECONDS = 5 * 60;

export const DOCUMENT_VIEW_EXPIRES_SECONDS = 60;

export const documentMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type DocumentMimeType = (typeof documentMimeTypes)[number];

export const documentTypeValues = documentTypes;
export const documentStatusValues = documentStatuses;

export const documentTypeLabels: Record<GeneralDocumentType, string> = {
  transcript: "Transcript / marksheet",
  passport: "Passport",
  certificate: "Certificate",
  bank_statement: "Bank statement",
  sop: "Statement of purpose",
  other: "Other",
};

export function isGeneralDocumentType(
  value: string,
): value is GeneralDocumentType {
  return (documentTypes as readonly string[]).includes(value);
}

export function documentTypeLabel(type: DocumentType): string {
  if (isGeneralDocumentType(type)) {
    return documentTypeLabels[type];
  }

  return type.replaceAll("_", " ");
}

export const documentStatusLabels: Record<DocumentStatus, string> = {
  pending: "Waiting for a counselor",
  approved: "Approved",
  rejected: "Needs another file",
};

export const deskDocumentStatusLabels: Record<DocumentStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const DOCUMENT_REJECT_NOTE_MESSAGE =
  "Write what they should fix so they can send the right file — which page is missing, or why this scan cannot be used.";

const mimeToExtension: Record<DocumentMimeType, readonly string[]> = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
};

export function extensionForMime(mime: DocumentMimeType): string {
  return mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "pdf";
}

export function mimeForExtension(extension: string): DocumentMimeType | null {
  const ext = extension.toLowerCase();
  if (ext === "pdf") {
    return "application/pdf";
  }
  if (ext === "jpg" || ext === "jpeg") {
    return "image/jpeg";
  }
  if (ext === "png") {
    return "image/png";
  }
  return null;
}

export function isAllowedDocumentMime(
  value: string,
): value is DocumentMimeType {
  return (documentMimeTypes as readonly string[]).includes(value);
}

export function mimeMatchesFilename(
  mime: DocumentMimeType,
  filename: string,
): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) {
    return false;
  }

  return mimeToExtension[mime].includes(ext);
}
