import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreDeparturePage } from "@/components/marketing/pre-departure-page";
import { DESTINATION_SLUGS, isDestinationSlug } from "@/lib/destinations";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { INTAKE_DEADLINES_REVALIDATE_SECONDS } from "@/lib/intakes/constants";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = INTAKE_DEADLINES_REVALIDATE_SECONDS;
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
  const copy = dict.destinations[slug].preDeparture;

  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    ogTitle: copy.ogTitle,
    ogDescription: copy.ogDescription,
    path: `/destinations/${slug}/pre-departure`,
    locale,
  });
}

export default async function PreDeparture({ params }: PageProps) {
  const { slug } = await params;
  const locale = await resolveLocale(params);

  if (!isDestinationSlug(slug)) {
    notFound();
  }

  const dict = getDictionary(locale);

  return <PreDeparturePage locale={locale} slug={slug} dict={dict} />;
}
