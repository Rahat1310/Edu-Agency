import type { ProgramCountry } from "@/db/schema";

export const DESTINATION_SLUGS = [
  "china",
  "india",
  "malaysia",
  "south-korea",
] as const;

export type DestinationSlug = (typeof DESTINATION_SLUGS)[number];

export type DestinationMeta = {
  slug: DestinationSlug;
  code: string;
  color: string;
  visaLabel: string;
};

export const DESTINATIONS: Record<DestinationSlug, DestinationMeta> = {
  china: {
    slug: "china",
    code: "CN",
    color: "#D44A4A",
    visaLabel: "X1 / X2",
  },
  india: {
    slug: "india",
    code: "IN",
    color: "#E9912A",
    visaLabel: "SII + e-Student",
  },
  malaysia: {
    slug: "malaysia",
    code: "MY",
    color: "#159B8C",
    visaLabel: "EMGS Student Pass",
  },
  "south-korea": {
    slug: "south-korea",
    code: "KR",
    color: "#4A67B3",
    visaLabel: "D-2 / D-4",
  },
};

export function isDestinationSlug(value: string): value is DestinationSlug {
  return DESTINATION_SLUGS.some((slug) => slug === value);
}

export function countryFromDestinationSlug(
  slug: DestinationSlug,
): ProgramCountry {
  return slug === "south-korea" ? "south_korea" : slug;
}

export function destinationSlugFromCountry(
  country: ProgramCountry,
): DestinationSlug {
  return country === "south_korea" ? "south-korea" : country;
}

export function preDeparturePath(slug: DestinationSlug): string {
  return `/destinations/${slug}/pre-departure`;
}
