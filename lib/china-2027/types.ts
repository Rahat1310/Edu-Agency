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
  intake: "March 2027" | "September 2027";
  language: "English" | "Chinese" | "English / Chinese" | "Not specified";
  duration: string;
  tuition: {
    amount: number | null;
    exact?: boolean;
    display: string;
    period: "semester" | "year" | "program" | "unspecified";
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
  supplementalSource?: string;
  reviewedOn?: string;
};
