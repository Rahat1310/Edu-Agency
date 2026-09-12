import type { Metadata } from "next";

import { SimplePlaceholderPage } from "@/components/marketing/simple-placeholder-page";
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
    title: dict.privacy.metaTitle,
    description: dict.privacy.metaDescription,
    path: "/privacy",
    locale,
  });
}

export default async function Privacy({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return (
    <SimplePlaceholderPage
      dict={dict}
      title={dict.privacy.title}
      body={dict.privacy.body}
    />
  );
}
