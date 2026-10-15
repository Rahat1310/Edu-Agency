import type { Metadata } from "next";

import { PageShell } from "@/components/layout/page-shell";
import { CostCalculatorPage } from "@/components/marketing/cost-calculator-page";
import { COST_CALCULATOR_ENABLED } from "@/lib/costs/config";
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
  if (!COST_CALCULATOR_ENABLED) {
    return (
      <section className="py-16 sm:py-24">
        <PageShell>
          <div className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="eyebrow-pill inline-flex">{dict.chrome.nav.costs}</p>
            <h1 className="font-heading mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {locale === "bn" ? "শীঘ্রই আসছে" : "Coming soon"}
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              {locale === "bn"
                ? "আমাদের স্টাডি অ্যাব্রড খরচ ক্যালকুলেটর প্রস্তুত হচ্ছে। শীঘ্রই এখানে খরচের হিসাব দেখতে পারবেন।"
                : "Our study abroad cost calculator is on its way. Check back soon to plan your study budget."}
            </p>
          </div>
        </PageShell>
      </section>
    );
  }
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
