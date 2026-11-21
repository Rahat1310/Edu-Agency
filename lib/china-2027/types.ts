export type ChinaOfferLevel =
  | "foundation"
  | "foundation_bachelor"
  | "language"
  | "bachelor"
  | "master"
  | "phd";

export type ChinaOffer = {
  id: string;
  university: string;
  universityId: string;
  location: string;
  level: ChinaOfferLevel;
  title: string;
  intake: string;
  entryIntakes?: string[];
  entryYear?: number;
  intakeStatus?: "scheduled" | "rolling" | "unconfirmed";
  progressionStart?: string | null;
  categories?: ChinaOfferLevel[];
  campus?: string | null;
  identityKey?: string;
  sourceRefs?: { file: string; sha256: string; pages: number[] }[];
  reviewedOn?: string;
  reviewRefs?: string[];
  programTerms?: { heading: string; items: string[] }[];
  language: "English" | "Chinese" | "English / Chinese" | "To be confirmed";
  duration: string;
  tuition: {
    amount: number | null;
    exact?: boolean;
    display: string;
    period: "semester" | "year" | "program";
    basis: "original" | "after-scholarship" | "combined";
  };
  fees: { label: string; value: string }[];
  scholarship: { summary: string; details: string[]; available: boolean };
  majors: string[];
  requirements: string[];
  documents: string[];
  notes: string[];
  deadlines: { label: string; date: string | null; display: string }[];
  eligibility: "eligible" | "confirm" | "unavailable";
  sourceFile: string;
};
