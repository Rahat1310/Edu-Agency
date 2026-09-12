import type { LeadDestinationInterest, LeadStatus } from "@/db/schema";
import {
  destinationSlugFromCountry,
  preDeparturePath,
} from "@/lib/destinations";
import { localizedHref } from "@/lib/i18n/paths";
import { programCountryFromLeadDestination } from "@/lib/visa-requirements/destination";
import { isVisaPipelineStage } from "@/lib/visa-applications/stage";

/** Portal is English-only; pre-departure pages live on the marketing site. */
export function preDepartureDashboardHref(
  destination: LeadDestinationInterest,
  status: LeadStatus,
): string | null {
  if (!isVisaPipelineStage(status)) {
    return null;
  }

  const country = programCountryFromLeadDestination(destination);
  if (!country) {
    return null;
  }

  return localizedHref(
    preDeparturePath(destinationSlugFromCountry(country)),
    "en",
  );
}
