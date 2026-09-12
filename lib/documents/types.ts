import type { DocumentStatus, DocumentType } from "@/db/schema";

export type StudentDocumentRow = {
  id: string;
  type: DocumentType;
  filename: string;
  status: DocumentStatus;
  reviewNote: string | null;
  uploadedAt: string | null;
};
