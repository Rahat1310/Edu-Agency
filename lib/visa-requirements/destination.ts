import {
  programCountries,
  type LeadDestinationInterest,
  type ProgramCountry,
} from "@/db/schema";

export function isProgramCountry(
  destination: LeadDestinationInterest,
): destination is ProgramCountry {
  return (programCountries as readonly string[]).includes(destination);
}

export function programCountryFromLeadDestination(
  destination: LeadDestinationInterest,
): ProgramCountry | null {
  return isProgramCountry(destination) ? destination : null;
}
