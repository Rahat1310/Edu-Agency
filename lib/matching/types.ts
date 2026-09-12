import type { ProgramCountry, ProgramLevel } from "@/db/schema";
import type {
  BudgetBand,
  EducationLevel,
  EligibilityDestination,
} from "@/lib/eligibility";

export type MatchingShortlistProgram = {
  id: string;
  universityName: string;
  country: ProgramCountry;
  level: ProgramLevel;
  field: string;
  tuitionAmount: string;
  tuitionCurrency: string;
};

export type RankedMatch = MatchingShortlistProgram & {
  rank: number;
  reason: string;
};

export type MatchProfileDraft = {
  educationLevel: EducationLevel | "";
  destinations: EligibilityDestination[];
  ielts?: number;
  toefl?: number;
  hsk?: number;
  topik?: number;
  budget: BudgetBand | "";
};

export type PortalMatchRanking = {
  matches: RankedMatch[];
  shortlistCount: number;
  cached: boolean;
  emptyShortlist: boolean;
  error?: string;
};
