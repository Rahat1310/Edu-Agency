import { DocumentLang } from "@/components/i18n/document-lang";
import { SiteLayout } from "@/components/layout/site-layout";
import { LOCALES, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Detail pages may be added after static generation, and legacy program IDs
// still resolve through the database. Each page validates the locale itself.
export const dynamicParams = true;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const lang = isLocale(locale) ? locale : "en";
  const dict = getDictionary(lang);

  return (
    <SiteLayout locale={lang} dict={dict}>
      <DocumentLang lang={lang} />
      <div lang={lang}>{children}</div>
    </SiteLayout>
  );
}
