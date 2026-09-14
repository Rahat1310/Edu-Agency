import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProgramDetail } from "@/components/marketing/program-detail";
import { JsonLd } from "@/components/seo/json-ld";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizedHref } from "@/lib/i18n/paths";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import {
  getPublishedProgramDetail,
  getPublishedProgramsByUniversity,
  listPublishedProgramIds,
} from "@/lib/programs-public";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { programCourseJsonLd, programSeoCopy } from "@/lib/seo/program-copy";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateStaticParams() {
  try {
    const ids = await listPublishedProgramIds();
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const program = await getPublishedProgramDetail(id);

  if (!program) {
    return pageMetadata({
      title: dict.programs.metaTitle,
      description: dict.programs.metaDescription,
      path: "/programs",
      locale,
    });
  }

  const copy = programSeoCopy(program, locale);

  return pageMetadata({
    title: copy.title,
    description: copy.description,
    ogTitle: copy.ogTitle,
    ogDescription: copy.ogDescription,
    path: `/programs/${id}`,
    locale,
  });
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await resolveLocale(params);
  const program = await getPublishedProgramDetail(id);

  if (!program) {
    notFound();
  }

  const relatedPrograms = await getPublishedProgramsByUniversity(
    program.universityName,
    program.id,
  );

  const copy = programSeoCopy(program, locale);
  const pageUrl = absoluteUrl(localizedHref(`/programs/${id}`, locale));

  return (
    <>
      <JsonLd data={programCourseJsonLd(program, copy, pageUrl)} />
      <ProgramDetail
        program={program}
        relatedPrograms={relatedPrograms}
        locale={locale}
        dict={getDictionary(locale)}
      />
    </>
  );
}
