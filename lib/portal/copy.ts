import type { LeadDestinationInterest, LeadStatus } from "@/db/schema";
import { portalGuideFor } from "@/lib/portal-tasks";

export function firstName(fullName: string | null, email: string): string {
  const fromName = fullName?.trim().split(/\s+/)[0];
  if (fromName) {
    return fromName;
  }

  const local = email.split("@")[0]?.trim();
  return local && local.length > 0 ? local : "there";
}

export function stageHeadline(status: LeadStatus): string {
  return portalGuideFor(status).headline;
}

export function stageBody(status: LeadStatus): string {
  return portalGuideFor(status).summary;
}

export function destinationLine(destination: LeadDestinationInterest): string {
  switch (destination) {
    case "china":
      return "You're looking at China.";
    case "india":
      return "You're looking at India.";
    case "malaysia":
      return "You're looking at Malaysia.";
    case "south_korea":
      return "You're looking at South Korea.";
    case "undecided":
      return "You haven't locked a country yet — that's fine. We handle China, India, Malaysia, and South Korea.";
  }
}

export function documentHints(destination: LeadDestinationInterest): string[] {
  const shared = [
    "A passport that is valid for at least 18 months",
    "Academic transcripts and certificates (scans of the originals)",
    "A recent passport-size photo on a white background",
  ];

  switch (destination) {
    case "china":
      return [
        ...shared,
        "Language scores if you have them (HSK, IELTS, or TOEFL)",
        "JW201/JW202 and the admission letter come later — after an offer, not now",
      ];
    case "india":
      return [
        ...shared,
        "You'll register on the Study in India (SII) portal before the student visa. We'll tell you when.",
      ];
    case "malaysia":
      return [
        ...shared,
        "The student pass goes through EMGS after an offer. You have to apply from outside Malaysia.",
      ];
    case "south_korea":
      return [
        ...shared,
        "After an offer: D-2 for a degree, or D-4 for a language programme",
      ];
    case "undecided":
      return [
        ...shared,
        "Language scores if you have them (IELTS, TOEFL, HSK, or TOPIK)",
        "Once you pick a country, the extra visa papers are different — we won't make you collect the wrong set",
      ];
  }
}

export function visaChecklistProgressLine(
  submitted: number,
  total: number,
): string {
  return `${submitted} of ${total} required documents submitted`;
}

export function visaChecklistComingSoonBody(
  destination: LeadDestinationInterest,
): string {
  if (destination === "undecided") {
    return "Once a counselor locks China, India, Malaysia, or South Korea on your file, the visa papers for that route will show here.";
  }

  return "We haven't published the visa papers for this route yet. WhatsApp us if you need the list by hand.";
}

export const visaChecklistStatusLabels = {
  missing: "Not uploaded yet",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Needs another file",
} as const;

export const visaChecklistLoadErrorTitle =
  "We couldn't load your visa checklist";
export const visaChecklistLoadErrorBody =
  "Your papers are still on the file. Try again, or WhatsApp us if this keeps happening.";

export const visaStatusEmptyTitle = "No visa file yet";
export const visaStatusEmptyBody =
  "Visa tracking will show here once a counselor starts the visa file.";

export const visaStatusLoadErrorTitle = "We couldn't load your visa tracking";
export const visaStatusLoadErrorBody =
  "Your file is still here. Try again, or WhatsApp us if this keeps happening.";
