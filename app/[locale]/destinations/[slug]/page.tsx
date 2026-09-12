import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DestinationPage } from "@/components/marketing/destination-page";
import { DESTINATION_SLUGS, isDestinationSlug } from "@/lib/destinations";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { loadUpcomingCountdownForSlug } from "@/lib/intakes/load";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 3600;
export const dynamicParams = false;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return DESTINATION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);

  if (!isDestinationSlug(slug)) {
    return {};
  }

  const dict = getDictionary(locale);
  const copy = dict.destinations[slug];

  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    ogTitle: copy.ogTitle,
    ogDescription: copy.ogDescription,
    path: `/destinations/${slug}`,
    locale,
  });
}

export default async function Destination({ params }: PageProps) {
  const { slug } = await params;
  const locale = await resolveLocale(params);

  if (!isDestinationSlug(slug)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const countdown = await loadUpcomingCountdownForSlug(slug);

  return (
    <DestinationPage
      locale={locale}
      slug={slug}
      dict={dict}
      countdown={countdown}
    />
  );
}
