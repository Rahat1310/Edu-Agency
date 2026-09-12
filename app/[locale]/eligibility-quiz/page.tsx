import type { Metadata } from "next";

import { EligibilityPage } from "@/components/eligibility/eligibility-page";
import { destinationFromParam } from "@/lib/eligibility";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { pageMetadata } from "@/lib/seo/page-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ destination?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return pageMetadata({
    title: dict.eligibility.metaTitle,
    description: dict.eligibility.metaDescription,
    path: "/eligibility-quiz",
    locale,
  });
}

export default async function EligibilityQuizRoute({
  params,
  searchParams,
}: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const query = await searchParams;

  return (
    <EligibilityPage
      locale={locale}
      dict={dict}
      initialDestination={destinationFromParam(query.destination)}
    />
  );
}
