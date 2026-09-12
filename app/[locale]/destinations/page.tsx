import type { Metadata } from "next";

import { DestinationsIndexPage } from "@/components/marketing/destinations-index-page";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const dynamic = "force-static";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return pageMetadata({
    title: dict.destinationsIndex.metaTitle,
    description: dict.destinationsIndex.metaDescription,
    ogTitle: dict.destinationsIndex.ogTitle,
    ogDescription: dict.destinationsIndex.ogDescription,
    path: "/destinations",
    locale,
  });
}

export default async function Destinations({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return <DestinationsIndexPage locale={locale} dict={dict} />;
}
