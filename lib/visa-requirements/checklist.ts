import type { DocumentStatus } from "@/db/schema";

export type VisaChecklistItemStatus =
  "missing" | "pending" | "approved" | "rejected";

export type VisaChecklistRequirement = {
  id: string;
  documentTypeKey: string;
  documentName: string;
  description: string | null;
  sortOrder: number;
  isPublished?: boolean;
};

export type VisaChecklistDocument = {
  type: string;
  status: DocumentStatus;
};

export type VisaChecklistItem = {
  id: string;
  documentTypeKey: string;
  documentName: string;
  description: string | null;
  sortOrder: number;
  status: VisaChecklistItemStatus;
};

export type VisaChecklist = {
  items: VisaChecklistItem[];
  submittedCount: number;
  total: number;
};

const STATUS_RANK: Record<DocumentStatus, number> = {
  approved: 3,
  pending: 2,
  rejected: 1,
};

export function documentTypeAnchorId(documentTypeKey: string): string {
  return `document-type-${documentTypeKey}`;
}

export function visaChecklistUploadHref(documentTypeKey: string): string {
  const params = new URLSearchParams({ type: documentTypeKey });
  return `/portal/documents?${params.toString()}#${documentTypeAnchorId(documentTypeKey)}`;
}

export function buildVisaChecklist(
  requirements: readonly VisaChecklistRequirement[],
  documents: readonly VisaChecklistDocument[],
): VisaChecklist {
  const ordered = requirements
    .filter((row) => row.isPublished !== false)
    .slice()
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.documentName.localeCompare(b.documentName);
    });

  const seen = new Set<string>();
  const items: VisaChecklistItem[] = [];

  for (const requirement of ordered) {
    if (seen.has(requirement.documentTypeKey)) {
      continue;
    }
    seen.add(requirement.documentTypeKey);

    const match = pickDocumentForType(documents, requirement.documentTypeKey);
    items.push({
      id: requirement.id,
      documentTypeKey: requirement.documentTypeKey,
      documentName: requirement.documentName,
      description: requirement.description,
      sortOrder: requirement.sortOrder,
      status: match?.status ?? "missing",
    });
  }

  return {
    items,
    submittedCount: items.filter(
      (item) => item.status === "pending" || item.status === "approved",
    ).length,
    total: items.length,
  };
}

function pickDocumentForType(
  documents: readonly VisaChecklistDocument[],
  documentTypeKey: string,
): VisaChecklistDocument | null {
  let best: VisaChecklistDocument | null = null;

  for (const document of documents) {
    if (document.type !== documentTypeKey) {
      continue;
    }

    if (!best || STATUS_RANK[document.status] > STATUS_RANK[best.status]) {
      best = document;
    }
  }

  return best;
}
