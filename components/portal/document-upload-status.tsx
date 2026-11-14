import { CheckCircle2, XCircle } from "lucide-react";
import type { StudentDocumentRow } from "@/lib/documents/types";

export function DocumentUploadStatus({
  documents,
}: {
  documents: readonly Pick<StudentDocumentRow, "status">[];
}) {
  const uploaded = documents.some((document) => document.status !== "rejected");
  const approved = documents.some((document) => document.status === "approved");
  const Icon = uploaded ? CheckCircle2 : XCircle;
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${uploaded ? "text-emerald-700" : "text-red-700"}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {approved
        ? "Uploaded · Approved"
        : uploaded
          ? "Uploaded · Awaiting review"
          : documents.length
            ? "Needs replacement"
            : "Not uploaded"}
    </span>
  );
}
import React from "react";
