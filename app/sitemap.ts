import type { MetadataRoute } from "next";

import { DESTINATION_SLUGS } from "@/lib/destinations";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 3600;

const STATIC_PAGES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/destinations", changeFrequency: "monthly", priority: 0.8 },
  { path: "/programs", changeFrequency: "daily", priority: 0.8 },
  { path: "/programs/compare", changeFrequency: "weekly", priority: 0.4 },
  { path: "/cost-calculator", changeFrequency: "weekly", priority: 0.6 },
  { path: "/success-stories", changeFrequency: "weekly", priority: 0.6 },
  { path: "/eligibility-quiz", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  ...DESTINATION_SLUGS.map((slug) => ({
    path: `/destinations/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
  ...DESTINATION_SLUGS.map((slug) => ({
    path: `/destinations/${slug}/pre-departure`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  })),
] as const;

function languageUrls(path: string): Record<string, string> {
  const en = absoluteUrl(localizedHref(path, "en"));
  const bn = absoluteUrl(localizedHref(path, "bn"));

  return {
    en,
    bn,
    "x-default": en,
  };
}

function entriesForPath(
  path: string,
  extras: Pick<
    MetadataRoute.Sitemap[number],
    "changeFrequency" | "priority" | "lastModified"
  >,
): MetadataRoute.Sitemap {
  const languages = languageUrls(path);

  return LOCALES.map((locale: Locale) => ({
    url: absoluteUrl(localizedHref(path, locale)),
    alternates: { languages },
    ...extras,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PAGES.flatMap((page) =>
    entriesForPath(page.path, {
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }),
  );

  let programEntries: MetadataRoute.Sitemap = [];

  try {
    const { listPublishedProgramsForSitemap } =
      await import("@/lib/programs-public");
    const published = await listPublishedProgramsForSitemap();

    programEntries = published.flatMap((program) =>
      entriesForPath(`/programs/${program.id}`, {
        changeFrequency: "weekly",
        priority: 0.6,
        lastModified: program.updatedAt ?? undefined,
      }),
    );
  } catch {
    programEntries = [];
  }

  return [...staticEntries, ...programEntries];
}
