import type { Metadata } from "next";

import { HomePage } from "@/components/marketing/home-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizedHref } from "@/lib/i18n/paths";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { INTAKE_DEADLINES_REVALIDATE_SECONDS } from "@/lib/intakes/constants";
import { loadUpcomingCountdownsBySlug } from "@/lib/intakes/load";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";
import {
  dailyRotationOffset,
  featuredWindowSize,
  rotateStories,
} from "@/lib/success-stories/featured";
import { successStoriesItemListJsonLd } from "@/lib/success-stories/json-ld";
import { loadPublishedSuccessStories } from "@/lib/success-stories/load";

export const revalidate = INTAKE_DEADLINES_REVALIDATE_SECONDS;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return pageMetadata({
    title: dict.home.metaTitle,
    description: dict.home.metaDescription,
    ogTitle: dict.home.ogTitle,
    ogDescription: dict.home.ogDescription,
    path: "/",
    locale,
  });
}

export default async function Home({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const [countdowns, stories] = await Promise.all([
    loadUpcomingCountdownsBySlug(),
    loadPublishedSuccessStories(),
  ]);
  const storiesOffset = dailyRotationOffset(new Date(), stories.length);
  const featured = rotateStories(
    stories,
    storiesOffset,
    featuredWindowSize(stories.length),
  );

  return (
    <>
      {featured.length > 0 ? (
        <JsonLd
          data={successStoriesItemListJsonLd(
            featured,
            dict,
            getSiteUrl(),
            absoluteUrl(localizedHref("/", locale)),
          )}
        />
      ) : null}
      <HomePage
        locale={locale}
        dict={dict}
        countdowns={countdowns}
        stories={stories}
        storiesOffset={storiesOffset}
      />
    </>
  );
}
