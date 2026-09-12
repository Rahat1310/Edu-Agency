import type { LeadDestinationInterest } from "@/db/schema";
import { leadDestinationLabels } from "@/lib/leads/labels";
import { absoluteUrl } from "@/lib/site-url";

export type NurtureCopyInput = {
  name: string;
  destinationInterest: string;
};

function destinationLabel(destinationInterest: string): string {
  if (destinationInterest in leadDestinationLabels) {
    return leadDestinationLabels[
      destinationInterest as LeadDestinationInterest
    ];
  }

  return destinationInterest;
}

export function renderNurtureTemplate(
  template: string,
  input: NurtureCopyInput,
): string {
  return template
    .replaceAll("{name}", input.name.trim() || "there")
    .replaceAll("{destination}", destinationLabel(input.destinationInterest))
    .replaceAll("{portalUrl}", absoluteUrl("/portal"));
}
