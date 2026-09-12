import type { Metadata } from "next";

import type { Locale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/get-dictionary";
import { localizedHref } from "@/lib/i18n/paths";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  ogTitle?: string;
  ogDescription?: string;
};

/**
 * Per-page Metadata API fields. Titles and descriptions are passed in
 * as finished copy — this helper does not interpolate a page name into
 * a shared template.
 */
export function pageMetadata({
  title,
  description,
  path,
  locale,
  ogTitle,
  ogDescription,
}: PageMetadataInput): Metadata {
  const socialTitle = ogTitle ?? title;
  const socialDescription = ogDescription ?? description;
  const alternates = languageAlternates(path);
  const canonical = localizedHref(path, locale);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: alternates.languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "bn" ? "bn_BD" : "en_US",
      alternateLocale: locale === "bn" ? ["en_US"] : ["bn_BD"],
      siteName: "Study Abroad Consultancy",
      title: socialTitle,
      description: socialDescription,
      url: canonical,
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description: socialDescription,
    },
  };
}
