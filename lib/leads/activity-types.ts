import type { LeadActivityType, LeadStatus } from "@/db/schema";

export type LeadActivityItem = {
  id: string;
  type: LeadActivityType;
  content: string | null;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus | null;
  createdAt: string | null;
  actorLabel: string;
  isVisibleToStudent: boolean;
};

export type StudentActivityItem = {
  id: string;
  type: LeadActivityType;
  content: string | null;
  toStatus: LeadStatus | null;
  createdAt: string | null;
  fromName: string;
};
