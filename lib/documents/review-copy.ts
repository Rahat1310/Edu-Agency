import type { DocumentType } from "@/db/schema";
import { documentTypeLabel } from "@/lib/documents/constants";

export function documentReviewActivityContent(input: {
  decision: "approved" | "rejected";
  type: DocumentType;
  filename: string;
  reviewNote: string | null;
}): string {
  const kind = documentTypeLabel(input.type);
  const file = input.filename.trim() || "file";

  if (input.decision === "approved") {
    return `We approved your ${kind} (${file}). You don't need to send that one again.`;
  }

  const reason = input.reviewNote?.trim() ?? "";
  return `Your ${kind} (${file}) needs another file.\n\n${reason}`;
}
