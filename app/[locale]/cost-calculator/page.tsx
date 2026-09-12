import type { Metadata } from "next";

import { CostCalculatorPage } from "@/components/marketing/cost-calculator-page";
import { buildYearlyEstimate } from "@/lib/costs/estimate";
import { getCostEstimates } from "@/lib/costs/load";
import { parseCostCalculatorQuery } from "@/lib/costs/query";
import { getBdtRates } from "@/lib/fx/rates";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { listPublishedProgramsForCostCalculator } from "@/lib/programs-public";

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
    title: dict.costCalculator.metaTitle,
    description: dict.costCalculator.metaDescription,
    ogTitle: dict.costCalculator.ogTitle,
    ogDescription: dict.costCalculator.ogDescription,
    path: "/cost-calculator",
    locale,
  });
}

export default async function CostCalculatorRoute({
  params,
  searchParams,
}: PageProps) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const raw = await searchParams;
  const query = parseCostCalculatorQuery({
    destination: first(raw.destination),
    country: first(raw.country),
    level: first(raw.level),
    program: first(raw.program),
  });

  if (!query.destination) {
    return (
      <CostCalculatorPage
        locale={locale}
        dict={dict}
        query={query}
        programs={[]}
        estimate={null}
        rates={null}
      />
    );
  }

  const [rows, programs] = await Promise.all([
    getCostEstimates(query.destination),
    listPublishedProgramsForCostCalculator(query.destination, query.level),
  ]);

  if (rows.length === 0) {
    return (
      <CostCalculatorPage
        locale={locale}
        dict={dict}
        query={query}
        programs={programs}
        estimate={null}
        rates={null}
      />
    );
  }

  const rates = await getBdtRates();
  const selectedProgram =
    query.programId === ""
      ? null
      : (programs.find((program) => program.id === query.programId) ?? null);

  return (
    <CostCalculatorPage
      locale={locale}
      dict={dict}
      query={query}
      programs={programs}
      estimate={buildYearlyEstimate({
        destination: query.destination,
        rows,
        program: selectedProgram,
        rates,
      })}
      rates={rates}
    />
  );
}
