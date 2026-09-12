import type { DeskVisaApplication } from "@/lib/visa-applications/types";

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toDeskVisaApplication(row: {
  id: string;
  applicationId: string;
  destination: DeskVisaApplication["destination"];
  subStatus: DeskVisaApplication["subStatus"];
  referenceNumber: string | null;
  submittedAt: Date | null;
  decidedAt: Date | null;
  notes: string | null;
}): DeskVisaApplication {
  return {
    id: row.id,
    applicationId: row.applicationId,
    destination: row.destination,
    subStatus: row.subStatus,
    referenceNumber: row.referenceNumber,
    submittedAt: toIso(row.submittedAt),
    decidedAt: toIso(row.decidedAt),
    notes: row.notes,
  };
}
