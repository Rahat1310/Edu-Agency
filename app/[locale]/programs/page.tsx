import type { Metadata } from "next";

import { ProgramsDirectory } from "@/components/marketing/programs-directory";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { pageMetadata } from "@/lib/seo/page-metadata";
import {
  getPublishedProgramPage,
  parsePublicProgramFilters,
} from "@/lib/programs-public";
import { parseCompareIds } from "@/lib/programs-compare";

export const revalidate = 3600;

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
    title: dict.programs.metaTitle,
    description: dict.programs.metaDescription,
    ogTitle: dict.programs.ogTitle,
    ogDescription: dict.programs.ogDescription,
    path: "/programs",
    locale,
  });
}

export default async function Programs({ params, searchParams }: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const raw = await searchParams;
  const filters = parsePublicProgramFilters({
    country: first(raw.country),
    level: first(raw.level),
    field: first(raw.field),
    page: first(raw.page),
  });
  const list = await getPublishedProgramPage(filters);
  const selectedIds = parseCompareIds(first(raw.ids));

  return (
    <ProgramsDirectory
      locale={locale}
      dict={dict}
      filters={filters}
      list={list}
      selectedIds={selectedIds}
    />
  );
}
