import type { Metadata } from "next";

import { ProgramCompareTable } from "@/components/marketing/program-compare-table";
import { getBdtRates } from "@/lib/fx/rates";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { parseCompareIds } from "@/lib/programs-compare";
import {
  getPublishedProgramsByIds,
  PROGRAMS_REVALIDATE_SECONDS,
} from "@/lib/programs-public";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = PROGRAMS_REVALIDATE_SECONDS;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);

  return pageMetadata({
    title: dict.programs.compare.metaTitle,
    description: dict.programs.compare.metaDescription,
    path: "/programs/compare",
    locale,
  });
}

export default async function ProgramComparePage({
  params,
  searchParams,
}: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const raw = await searchParams;
  const ids = parseCompareIds(first(raw.ids));
  const programs = ids.length === 0 ? [] : await getPublishedProgramsByIds(ids);
  const rates = programs.length > 0 ? await getBdtRates() : null;

  return (
    <ProgramCompareTable
      locale={locale}
      dict={dict}
      programs={programs}
      requestedCount={ids.length}
      rates={rates}
    />
  );
}
