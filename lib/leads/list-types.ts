import type { LeadDestinationInterest, LeadStatus } from "@/db/schema";
import type { AssessmentSection } from "@/lib/consultation/presentation";

export type LeadListRow = {
  id: string;
  name: string;
  source: string;
  phone: string;
  whatsapp: string | null;
  destinationInterest: LeadDestinationInterest;
  status: LeadStatus;
  createdAt: string | null;
};

export type LeadDetail = LeadListRow & {
  email: string | null;
  message: string | null;
  source: string;
  quizAnswers: unknown;
  assignedCounselorId: string | null;
  reference: string | null;
  assessmentSections: AssessmentSection[];
};

export type LeadListResult = {
  rows: LeadListRow[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};
