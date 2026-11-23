import { notFound } from "next/navigation";
import {
  MalaysiaInstitutionPage,
  malaysiaInstitutionPath,
  type MalaysiaQuery,
} from "@/components/marketing/malaysia-catalogue";
import { getMalaysiaInstitution, malaysiaInstitutions } from "@/lib/malaysia";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { pageMetadata } from "@/lib/seo/page-metadata";
type Props = {
  params: Promise<{ locale: string; institution: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export function generateStaticParams() {
  return malaysiaInstitutions.map((i) => ({ institution: i.id }));
}
export async function generateMetadata({ params }: Props) {
  const locale = await resolveLocale(params);
  const { institution } = await params;
  const i = getMalaysiaInstitution(institution);
  if (!i) return {};
  return pageMetadata({
    title: `${i.name} | Malaysia`,
    description:
      locale === "bn"
        ? `${i.name}-এর প্রোগ্রাম, প্রকাশিত ফি ও ভর্তির শর্ত দেখুন।`
        : `Explore ${i.name} programmes, dated fee schedules and admission conditions.`,
    path: malaysiaInstitutionPath(i.id),
    locale,
  });
}
export default async function Institution({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  const { institution } = await params;
  const i = getMalaysiaInstitution(institution);
  if (!i) notFound();
  const raw = await searchParams;
  const query = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  ) as MalaysiaQuery;
  return (
    <MalaysiaInstitutionPage institution={i} locale={locale} query={query} />
  );
}
