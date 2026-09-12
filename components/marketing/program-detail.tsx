import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { costCalculatorHref } from "@/lib/costs/href";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import {
  programCountryLabels,
  programLevelLabels,
} from "@/lib/programs-labels";
import type { PublicProgramDetail } from "@/lib/programs-public";

type ProgramDetailProps = {
  program: PublicProgramDetail;
  locale: Locale;
  dict: Dictionary;
};

export function ProgramDetail({ program, locale, dict }: ProgramDetailProps) {
  const intake = program.intakeMonths?.filter(Boolean) ?? [];

  return (
    <article className="py-10 sm:py-16">
      <PageShell className="max-w-3xl">
        <Link
          href={localizedHref("/programs", locale)}
          className="focus-ring rounded-md text-sm font-bold text-[var(--brand-blue)]"
        >
          {dict.programs.backToDirectory}
        </Link>
        <p className="font-utility mt-6 text-[0.68rem] font-semibold tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
          {programCountryLabels[program.country]} ·{" "}
          {programLevelLabels[program.level]}
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-[-0.045em] text-[var(--brand-navy)] sm:text-5xl">
          {program.universityName}
        </h1>
        <p className="mt-4 text-xl text-[var(--brand-ink)]">{program.field}</p>

        <dl className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <dt className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
              {dict.programs.tuitionLabel}
            </dt>
            <dd className="mt-2">
              <p className="text-lg font-bold text-[var(--brand-navy)] tabular-nums">
                {program.tuitionAmount} {program.tuitionCurrency}
              </p>
              <Link
                href={costCalculatorHref(locale, {
                  destination: program.country,
                  level: program.level,
                  programId: program.id,
                })}
                className="focus-ring mt-3 inline-flex text-sm font-bold text-[var(--brand-blue)]"
              >
                {dict.programs.estimateCosts}
              </Link>
            </dd>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <dt className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
              {dict.programs.intakeLabel}
            </dt>
            <dd className="mt-2 text-lg font-bold text-[var(--brand-navy)]">
              {intake.length > 0 ? intake.join(", ") : "—"}
            </dd>
          </div>
        </dl>

        {program.requirements ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-[var(--brand-navy)]">
              {dict.programs.requirementsLabel}
            </h2>
            <p className="mt-3 text-base leading-8 whitespace-pre-wrap text-[var(--brand-ink)]/80">
              {program.requirements}
            </p>
          </section>
        ) : null}

        {program.scholarshipInfo ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-[var(--brand-navy)]">
              {dict.programs.scholarshipLabel}
            </h2>
            <p className="mt-3 text-base leading-8 whitespace-pre-wrap text-[var(--brand-ink)]/80">
              {program.scholarshipInfo}
            </p>
          </section>
        ) : null}
      </PageShell>
    </article>
  );
}
