import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import {
  visaRequirements,
  type ProgramCountry,
  type VisaRequirement,
} from "@/db/schema";
import {
  VISA_REQUIREMENTS_CACHE_TAG,
  VISA_REQUIREMENTS_REVALIDATE_SECONDS,
} from "@/lib/visa-requirements/constants";

const checklistColumns = {
  id: visaRequirements.id,
  destination: visaRequirements.destination,
  documentName: visaRequirements.documentName,
  documentTypeKey: visaRequirements.documentTypeKey,
  description: visaRequirements.description,
  sortOrder: visaRequirements.sortOrder,
  notes: visaRequirements.notes,
} as const;

export type PublishedVisaRequirement = {
  id: string;
  destination: ProgramCountry;
  documentName: string;
  documentTypeKey: string;
  description: string | null;
  sortOrder: number;
  notes: string | null;
};

async function queryPublishedVisaRequirements(): Promise<
  PublishedVisaRequirement[]
> {
  return db
    .select(checklistColumns)
    .from(visaRequirements)
    .where(eq(visaRequirements.isPublished, true))
    .orderBy(
      asc(visaRequirements.destination),
      asc(visaRequirements.sortOrder),
      asc(visaRequirements.documentName),
    );
}

function listPublishedVisaRequirementsCached() {
  return unstable_cache(
    queryPublishedVisaRequirements,
    ["visa-requirements-published"],
    {
      tags: [VISA_REQUIREMENTS_CACHE_TAG],
      revalidate: VISA_REQUIREMENTS_REVALIDATE_SECONDS,
    },
  )();
}

export async function loadPublishedVisaRequirements(
  destination: ProgramCountry,
): Promise<PublishedVisaRequirement[]> {
  const rows = await listPublishedVisaRequirementsCached();
  return rows.filter((row) => row.destination === destination);
}

export async function listPublishedVisaDocumentTypeKeys(): Promise<string[]> {
  try {
    const rows = await listPublishedVisaRequirementsCached();
    return [...new Set(rows.map((row) => row.documentTypeKey))];
  } catch {
    return [];
  }
}

export async function listVisaRequirementsForAdmin(
  destination: ProgramCountry | "",
): Promise<VisaRequirement[]> {
  const where =
    destination === ""
      ? undefined
      : and(eq(visaRequirements.destination, destination));

  return db
    .select()
    .from(visaRequirements)
    .where(where)
    .orderBy(
      asc(visaRequirements.destination),
      asc(visaRequirements.sortOrder),
      asc(visaRequirements.documentName),
    );
}
