import type { LeadDestinationInterest, LeadStatus } from "@/db/schema";
import { leadDestinationInterests, leadStatuses } from "@/db/schema";

export const leadDestinationLabels: Record<LeadDestinationInterest, string> = {
  china: "China",
  india: "India",
  malaysia: "Malaysia",
  south_korea: "South Korea",
  undecided: "Undecided",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  documents: "Documents",
  applied: "Applied",
  offer: "Offer",
  visa: "Visa",
  departed: "Departed",
};

export const leadDestinationOptions = leadDestinationInterests;
export const leadStatusOptions = leadStatuses;

export function daysSince(iso: string | null): number {
  if (!iso) {
    return 0;
  }

  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86_400_000));
}

export function formatDaysInStage(days: number): string {
  if (days <= 0) {
    return "Today";
  }

  return days === 1 ? "1 day" : `${days} days`;
}

export function formatLeadDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
