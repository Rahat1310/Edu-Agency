import type { Metadata } from "next";

import { ContactPage } from "@/components/marketing/contact-page";
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
    title: dict.contact.metaTitle,
    description: dict.contact.metaDescription,
    ogTitle: dict.contact.ogTitle,
    ogDescription: dict.contact.ogDescription,
    path: "/contact",
    locale,
  });
}

export default async function Contact({ params }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return (
    <>
      <div className="bg-slate-50 px-4 py-4 text-center text-sm">
        Looking for admission and scholarship counselling?{" "}
        <a
          className="font-semibold text-blue-800 underline"
          href={locale === "bn" ? "/bn/consultation" : "/consultation"}
        >
          Request a free student profile assessment
        </a>
        .
      </div>
      <ContactPage dict={dict} locale={locale} />
    </>
  );
}
