import type { Metadata } from "next";

import { AboutPage } from "@/components/marketing/about-page";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { loadPublishedSuccessStories } from "@/lib/success-stories/load";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const dynamic = "force-static";
export const revalidate = 3600;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return pageMetadata({
    title: dict.about.metaTitle,
    description: dict.about.metaDescription,
    ogTitle: dict.about.ogTitle,
    ogDescription: dict.about.ogDescription,
    path: "/about",
    locale,
  });
}

export default async function About({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  const stories = await loadPublishedSuccessStories();

  return (
    <AboutPage
      locale={locale}
      dict={dict}
      hasPublishedStories={stories.length > 0}
    />
  );
}
