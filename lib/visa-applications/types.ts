import type {
  LeadDestinationInterest,
  VisaApplicationSubStatus,
} from "@/db/schema";

export type DeskVisaApplication = {
  id: string;
  applicationId: string;
  destination: LeadDestinationInterest;
  subStatus: VisaApplicationSubStatus;
  referenceNumber: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  notes: string | null;
};

export type StudentVisaStatus = {
  subStatus: VisaApplicationSubStatus;
  referenceNumber: string | null;
};
