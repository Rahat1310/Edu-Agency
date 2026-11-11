import { redirect } from "next/navigation";

import { PortalDocuments } from "@/components/portal/portal-documents";
import { getStudentApplication } from "@/lib/auth-helpers";
import { loadApplicationCase } from "@/lib/applications/load";
import { applicationDocumentChecklist } from "@/lib/applications/documents";
import { isVisaPipelineStage } from "@/lib/visa-applications/stage";
import { listDocumentsForApplication } from "@/lib/documents/list";
import { isDocumentTypeKey } from "@/lib/documents/type-key";
import type { ProgramCountry } from "@/db/schema";
import { firstName } from "@/lib/portal/copy";
import { programCountryFromLeadDestination } from "@/lib/visa-requirements/destination";
import {
  loadPublishedVisaRequirements,
  type PublishedVisaRequirement,
} from "@/lib/visa-requirements/load";

type PageProps = {
  searchParams: Promise<{ type?: string | string[] }>;
};

export default async function PortalDocumentsPage({ searchParams }: PageProps) {
  const application = await getStudentApplication();

  if (!application) {
    redirect("/portal/onboarding");
  }

  const params = await searchParams;
  const country = programCountryFromLeadDestination(
    application.lead.destinationInterest,
  );

  const [documents, visaSlots, applicationCase] = await Promise.all([
    listDocumentsForApplication(application.application.id),
    isVisaPipelineStage(application.lead.status)
      ? loadVisaSlots(country)
      : Promise.resolve([]),
    loadApplicationCase(application.application.id),
  ]);

  return (
    <PortalDocuments
      applicationId={application.application.id}
      applicationSlots={
        applicationCase
          ? applicationDocumentChecklist(
              applicationCase.data,
              applicationCase.requestedDocuments,
            )
          : undefined
      }
      documents={documents}
      destination={application.lead.destinationInterest}
      studentName={firstName(application.user.fullName, application.user.email)}
      visaSlots={visaSlots.map((slot) => ({
        documentTypeKey: slot.documentTypeKey,
        documentName: slot.documentName,
        description: slot.description,
      }))}
      focusType={requestedDocumentType(params.type)}
    />
  );
}

async function loadVisaSlots(
  country: ProgramCountry | null,
): Promise<PublishedVisaRequirement[]> {
  if (!country) {
    return [];
  }

  try {
    return await loadPublishedVisaRequirements(country);
  } catch {
    return [];
  }
}

function requestedDocumentType(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !isDocumentTypeKey(raw)) {
    return null;
  }
  return raw;
}
