import type { Dictionary } from "@/lib/i18n/types";
import { getSiteUrl } from "@/lib/site-url";

export function organizationJsonLd(dict: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: dict.meta.siteName,
    url: getSiteUrl(),
    description: dict.meta.defaultDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "BD",
    },
    areaServed: {
      "@type": "Country",
      name: "Bangladesh",
    },
    knowsLanguage: ["en", "bn"],
  };
}
