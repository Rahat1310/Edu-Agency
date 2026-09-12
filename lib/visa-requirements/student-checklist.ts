import "server-only";

import type { LeadDestinationInterest } from "@/db/schema";
import { listDocumentsForApplication } from "@/lib/documents/list";
import {
  buildVisaChecklist,
  type VisaChecklist,
} from "@/lib/visa-requirements/checklist";
import { programCountryFromLeadDestination } from "@/lib/visa-requirements/destination";
import { loadPublishedVisaRequirements } from "@/lib/visa-requirements/load";

export type StudentVisaChecklistResult = {
  checklist: VisaChecklist;
  error: boolean;
};

const EMPTY_CHECKLIST: VisaChecklist = {
  items: [],
  submittedCount: 0,
  total: 0,
};

export async function loadStudentVisaChecklist(
  applicationId: string,
  destination: LeadDestinationInterest,
): Promise<StudentVisaChecklistResult> {
  const country = programCountryFromLeadDestination(destination);

  try {
    const [documents, requirements] = await Promise.all([
      listDocumentsForApplication(applicationId),
      country ? loadPublishedVisaRequirements(country) : Promise.resolve([]),
    ]);

    return {
      checklist: buildVisaChecklist(requirements, documents),
      error: false,
    };
  } catch {
    return { checklist: EMPTY_CHECKLIST, error: true };
  }
}
