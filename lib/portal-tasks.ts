import type { LeadStatus } from "@/db/schema";
import { leadStatuses } from "@/db/schema";

/**
 * Student-facing copy for each pipeline stage. Edit headlines, summaries,
 * and task lists here — dashboard components only look this table up.
 * Same idea as `eligibilityRules` in Phase 2.6.
 */

export type PortalTask = {
  id: string;
  title: string;
  detail?: string;
  href?: "/portal/documents" | "/portal/matches";
};

export type PortalStageGuide = {
  headline: string;
  summary: string;
  tasks: readonly PortalTask[];
};

export const portalStageGuides: Record<LeadStatus, PortalStageGuide> = {
  new: {
    headline: "We’ve received your details",
    summary: "Your counsellor will contact you to discuss your plans.",
    tasks: [
      { id: "new-contact", title: "Check your phone for a message from us" },
      {
        id: "new-matches",
        title: "Explore suggested programmes",
        href: "/portal/matches",
      },
      {
        id: "new-passport",
        title: "Have your passport and latest marksheet ready",
      },
    ],
  },
  contacted: {
    headline: "You’re in touch with your counsellor",
    summary: "We’ll help you choose a programme and prepare your application.",
    tasks: [
      {
        id: "contacted-reply",
        title: "Reply to your counsellor’s latest message",
      },
      {
        id: "contacted-questions",
        title: "Discuss your budget and preferred course",
      },
      {
        id: "contacted-hold-files",
        title: "Check which documents you need",
        href: "/portal/documents",
      },
    ],
  },
  documents: {
    headline: "Your documents are being reviewed",
    summary:
      "We’ll let you know if anything is missing or needs a clearer copy.",
    tasks: [
      {
        id: "documents-passport",
        title: "Upload your passport photo page",
        href: "/portal/documents",
      },
      {
        id: "documents-transcripts",
        title: "Add your certificates and transcripts",
        href: "/portal/documents",
      },
      {
        id: "documents-language",
        title: "Add language test results, if available",
        href: "/portal/documents",
      },
    ],
  },
  applied: {
    headline: "Your application is with the university",
    summary: "We’ll share the university’s response here when it arrives.",
    tasks: [
      { id: "applied-wait", title: "Check here for application updates" },
      {
        id: "applied-phone",
        title: "Reply promptly if we request more documents",
      },
      {
        id: "applied-scam",
        title: "Confirm payment requests with your counsellor",
      },
    ],
  },
  offer: {
    headline: "Your offer has arrived",
    summary: "Review the conditions and deadline with your counsellor.",
    tasks: [
      { id: "offer-read", title: "Read your offer letter and its conditions" },
      {
        id: "offer-deposit",
        title: "Confirm the deposit and payment details with us",
      },
      { id: "offer-compare", title: "Let your counsellor know your decision" },
    ],
  },
  visa: {
    headline: "Your visa is in progress",
    summary: "Follow your visa checklist and check here for updates.",
    tasks: [
      { id: "visa-passport", title: "Keep your passport available" },
      {
        id: "visa-country",
        title: "Upload any requested visa documents",
        href: "/portal/documents",
      },
      { id: "visa-flights", title: "Confirm your visa before booking flights" },
    ],
  },
  departed: {
    headline: "Ready for your next chapter",
    summary: "Your counsellor can help with arrival and settling in.",
    tasks: [
      { id: "departed-land", title: "Let us know when you arrive" },
      {
        id: "departed-photos",
        title: "Keep copies of your passport and offer letter handy",
      },
      { id: "departed-week", title: "Confirm your housing and airport pickup" },
    ],
  },
};

export function portalGuideFor(status: LeadStatus): PortalStageGuide {
  return portalStageGuides[status];
}

export function portalTasksFor(status: LeadStatus): readonly PortalTask[] {
  return portalStageGuides[status].tasks;
}

export const portalPipelineStages = leadStatuses;
