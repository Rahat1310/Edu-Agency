import type { LeadStatus } from "@/db/schema";
import { calendarDateInTimeZone } from "@/lib/intakes/countdown";
import type { NurtureStep } from "@/lib/nurture/sequence";
import { NURTURE_ELIGIBLE_STATUSES } from "@/lib/nurture/sequence";

export type NurtureCandidate = {
  leadId: string;
  name: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  destinationInterest: string;
  status: LeadStatus;
  lastContactAt: Date;
  lastInboundAt: Date | null;
  sentStepIds: readonly string[];
};

export type DueNurture = {
  leadId: string;
  name: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  destinationInterest: string;
  status: LeadStatus;
  step: NurtureStep;
  daysSinceContact: number;
  lastInboundAt: string | null;
};

const ELIGIBLE = new Set<string>(NURTURE_ELIGIBLE_STATUSES);

export function isNurtureEligibleStatus(status: string): boolean {
  return ELIGIBLE.has(status);
}

export function daysSinceContact(
  lastContactAt: Date,
  now: Date,
  timeZone?: string,
): number {
  const today = calendarDateInTimeZone(now, timeZone);
  const then = calendarDateInTimeZone(lastContactAt, timeZone);
  const todayUtc = Date.parse(`${today}T00:00:00Z`);
  const thenUtc = Date.parse(`${then}T00:00:00Z`);

  return Math.max(0, Math.round((todayUtc - thenUtc) / 86_400_000));
}

/**
 * Latest sequence bucket the lead has reached that has not already been sent.
 * Does not backfill older unsent steps.
 */
export function matchNurtureStep(
  candidate: Pick<
    NurtureCandidate,
    "status" | "lastContactAt" | "lastInboundAt" | "sentStepIds"
  >,
  sequence: readonly NurtureStep[],
  now: Date,
): NurtureStep | null {
  if (!isNurtureEligibleStatus(candidate.status)) {
    return null;
  }

  if (candidate.lastInboundAt) {
    return null;
  }

  const days = daysSinceContact(candidate.lastContactAt, now);
  const sent = new Set(candidate.sentStepIds);

  const current = [...sequence]
    .filter((step) => step.afterDays <= days)
    .sort((a, b) => b.afterDays - a.afterDays)[0];

  if (!current || sent.has(current.id)) {
    return null;
  }

  return current;
}

export function matchDueNurture(
  candidates: readonly NurtureCandidate[],
  sequence: readonly NurtureStep[],
  now: Date,
): DueNurture[] {
  const due: DueNurture[] = [];

  for (const candidate of candidates) {
    const step = matchNurtureStep(candidate, sequence, now);
    if (!step) {
      continue;
    }

    due.push({
      leadId: candidate.leadId,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      whatsapp: candidate.whatsapp,
      destinationInterest: candidate.destinationInterest,
      status: candidate.status,
      step,
      daysSinceContact: daysSinceContact(candidate.lastContactAt, now),
      lastInboundAt: candidate.lastInboundAt
        ? candidate.lastInboundAt.toISOString()
        : null,
    });
  }

  return due;
}

export function isWhatsAppSessionOpen(
  lastInboundAt: Date | string | null,
  now: Date,
  sessionHours: number,
): boolean {
  if (!lastInboundAt) {
    return false;
  }

  const inboundAt =
    lastInboundAt instanceof Date ? lastInboundAt : new Date(lastInboundAt);

  if (Number.isNaN(inboundAt.getTime())) {
    return false;
  }

  return now.getTime() - inboundAt.getTime() < sessionHours * 3_600_000;
}
