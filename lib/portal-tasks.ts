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
    headline: "We've received your details.",
    summary:
      "Someone from this office will WhatsApp you — usually within a day or two. You don't need to chase unless it's been longer than that.",
    tasks: [
      {
        id: "new-whatsapp",
        title: "Keep WhatsApp notifications on",
        detail:
          "We'll message from this office. Save the number when it comes in so it doesn't look like spam.",
      },
      {
        id: "new-matches",
        title: "See which published programs fit your file",
        detail:
          "We'll filter the directory first, then rank a short list. This is not an offer.",
        href: "/portal/matches",
      },
      {
        id: "new-passport",
        title: "Have your passport and latest marksheet nearby",
        detail: "The first call goes faster if those two are in reach.",
      },
      {
        id: "new-family",
        title: "Tell a parent or guardian we'll be in touch",
        detail:
          "So nobody is surprised when an unknown number calls about university.",
      },
    ],
  },
  contacted: {
    headline: "A counselor is talking with you.",
    summary:
      "We've already reached out, or tried to. If the chat went quiet, send a WhatsApp. Don't wait and wonder.",
    tasks: [
      {
        id: "contacted-reply",
        title: "Reply to the counselor, even if it's just “got it”",
        detail: "Silence looks like a wrong number on our side.",
      },
      {
        id: "contacted-questions",
        title: "Write down what your family wants to ask",
        detail: "Budget, city, and degree are the three we hear most.",
      },
      {
        id: "contacted-hold-files",
        title: "Don't send a pile of PDFs until we ask",
        detail: "We'll tell you the order. Random files in WhatsApp get lost.",
      },
    ],
  },
  documents: {
    headline: "We're reviewing your documents.",
    summary:
      "Universities want a passport scan, transcripts, and language scores before they can move. We'll WhatsApp you if something is missing.",
    tasks: [
      {
        id: "documents-passport",
        title: "Scan the photo page of your passport, in colour",
        href: "/portal/documents",
      },
      {
        id: "documents-transcripts",
        title: "Scan transcripts and certificates",
        detail: "Keep the originals. We need clear photos or PDFs.",
        href: "/portal/documents",
      },
      {
        id: "documents-language",
        title: "Add language scores if you have them",
        detail: "IELTS, TOEFL, HSK, or TOPIK — whichever you sat.",
      },
      {
        id: "documents-wait",
        title: "Upload here only when we name the file",
        detail:
          "Don't dump everything into WhatsApp hoping we sort it. Documents in this portal stay with your file.",
        href: "/portal/documents",
      },
    ],
  },
  applied: {
    headline: "Your application is with the university.",
    summary:
      "This wait is normal. We'll tell you as soon as they reply. You don't need to email them yourself.",
    tasks: [
      {
        id: "applied-wait",
        title: "Let us handle the university email",
        detail: "If they ask for something extra, we'll tell you the same day.",
      },
      {
        id: "applied-phone",
        title: "Keep your phone on",
        detail: "Extra document requests often have a short deadline.",
      },
      {
        id: "applied-scam",
        title: "Don't pay anyone who claims to be the university",
        detail:
          "If a payment is real, we will say so on WhatsApp and in this file.",
      },
    ],
  },
  offer: {
    headline: "There's an offer to read with your family.",
    summary:
      "Some offers have conditions — marks, a deposit, a language score. We'll go through the letter with you before you say yes.",
    tasks: [
      {
        id: "offer-read",
        title: "Read the offer letter together, including the deadline",
        detail:
          "Conditions hide in the small print. Ask us if a sentence is unclear.",
      },
      {
        id: "offer-deposit",
        title: "Ask us before you pay a deposit",
        detail:
          "We'll confirm the account details so the money goes to the right place.",
      },
      {
        id: "offer-compare",
        title: "Tell us if a second offer arrives",
        detail:
          "We can sit with you and compare them — tuition, city, and conditions.",
      },
    ],
  },
  visa: {
    headline: "We're lining up your visa papers.",
    summary:
      "Don't book flights yet. Each country has its own order, and sending the wrong form first costs weeks.",
    tasks: [
      {
        id: "visa-passport",
        title: "Keep your passport free for this visa",
        detail: "Don't start another visa trip in the middle of this one.",
      },
      {
        id: "visa-flights",
        title: "Don't book flights until we say so",
        detail: "A cheap ticket is expensive if the visa isn't ready.",
      },
      {
        id: "visa-country",
        title: "Wait for the country-specific list from your counselor",
        detail:
          "China needs JW201/JW202 after the offer. Malaysia's student pass is via EMGS, from outside the country. India starts on the SII portal. Korea is D-2 or D-4.",
      },
    ],
  },
  departed: {
    headline: "You're on your way.",
    summary:
      "Message us when you land so we know you're safe. After that we can help with SIM, hostel, and the first week.",
    tasks: [
      {
        id: "departed-land",
        title: "WhatsApp us when you land",
        detail: "A short “I've arrived” is enough.",
      },
      {
        id: "departed-photos",
        title: "Keep a photo of your passport and offer letter on your phone",
        detail: "Airport and hostel desks ask for these more than once.",
      },
      {
        id: "departed-week",
        title: "Ask us about SIM, hostel, and the first-week checklist",
        detail: "We'd rather you ask twice than get stuck at a kiosk.",
      },
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
