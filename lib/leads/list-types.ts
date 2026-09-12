import type { LeadDestinationInterest, LeadStatus } from "@/db/schema";

export type LeadListRow = {
  id: string;
  name: string;
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
};

export type LeadListResult = {
  rows: LeadListRow[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};
