import type { LeadDestinationInterest, LeadStatus } from "@/db/schema";

export const PIPELINE_COLUMN_CAP = 100;

export type PipelineCard = {
  id: string;
  name: string;
  destinationInterest: LeadDestinationInterest;
  status: LeadStatus;
  stageEnteredAt: string | null;
  daysInStage: number;
};

export type PipelineBoardData = {
  cards: PipelineCard[];
  hiddenByStatus: Partial<Record<LeadStatus, number>>;
};
