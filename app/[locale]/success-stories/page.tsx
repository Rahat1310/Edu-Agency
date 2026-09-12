import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { SuccessStoriesPage } from "@/components/marketing/success-stories-page";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizedHref } from "@/lib/i18n/paths";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";
import { parseStoryDestination } from "@/lib/success-stories/featured";
import { successStoriesItemListJsonLd } from "@/lib/success-stories/json-ld";
import { loadPublishedSuccessStories } from "@/lib/success-stories/load";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return pageMetadata({
    title: dict.successStories.metaTitle,
    description: dict.successStories.metaDescription,
    ogTitle: dict.successStories.ogTitle,
    ogDescription: dict.successStories.ogDescription,
    path: "/success-stories",
    locale,
  });
}

export default async function SuccessStoriesRoute({
  params,
  searchParams,
}: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const raw = await searchParams;
  const destination = parseStoryDestination(
    first(raw.destination) ?? first(raw.country),
  );
  const stories = await loadPublishedSuccessStories(destination);
  const pageUrl = absoluteUrl(localizedHref("/success-stories", locale));

  return (
    <>
      {stories.length > 0 ? (
        <JsonLd
          data={successStoriesItemListJsonLd(
            stories,
            dict,
            getSiteUrl(),
            pageUrl,
          )}
        />
      ) : null}
      <SuccessStoriesPage
        locale={locale}
        dict={dict}
        destination={destination}
        stories={stories}
      />
    </>
  );
}
