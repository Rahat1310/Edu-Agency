import type { VisaApplicationSubStatus } from "@/db/schema";

export const visaApplicationSubStatusLabels: Record<
  VisaApplicationSubStatus,
  string
> = {
  preparing_documents: "Preparing documents",
  submitted: "Submitted",
  interview_scheduled: "Interview scheduled",
  approved: "Approved",
  rejected: "Not approved",
};

export function visaApplicationStudentLine(input: {
  subStatus: VisaApplicationSubStatus;
  referenceNumber: string | null;
}): string {
  const reference = formatVisaReference(input.referenceNumber);

  switch (input.subStatus) {
    case "preparing_documents":
      return reference
        ? `We're preparing the documents for your visa application, reference #${reference}.`
        : "We're preparing the documents for your visa application.";
    case "submitted":
      return reference
        ? `Your visa application has been submitted, reference #${reference}.`
        : "Your visa application has been submitted.";
    case "interview_scheduled":
      return reference
        ? `Your visa interview has been scheduled, reference #${reference}.`
        : "Your visa interview has been scheduled.";
    case "approved":
      return reference
        ? `Your visa application has been approved, reference #${reference}.`
        : "Your visa application has been approved.";
    case "rejected":
      return "Your visa application was not approved. A counselor will talk you through what happens next.";
  }
}

export function visaApplicationAuditLine(input: {
  subStatus: VisaApplicationSubStatus;
  referenceNumber: string | null;
  subStatusChanged: boolean;
  referenceChanged: boolean;
  datesChanged: boolean;
  notesChanged: boolean;
}): string {
  if (input.subStatusChanged || input.referenceChanged) {
    return visaApplicationStudentLine({
      subStatus: input.subStatus,
      referenceNumber: input.referenceNumber,
    });
  }

  const parts: string[] = [];
  if (input.datesChanged) {
    parts.push("dates");
  }
  if (input.notesChanged) {
    parts.push("notes");
  }

  if (parts.length === 0) {
    return "Visa tracking updated.";
  }

  return `Visa tracking ${parts.join(" and ")} updated.`;
}

function formatVisaReference(value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/^#+/, "");
}
