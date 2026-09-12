import type { LeadStatus } from "@/db/schema";

export function isVisaPipelineStage(status: LeadStatus): boolean {
  return status === "visa" || status === "departed";
}
