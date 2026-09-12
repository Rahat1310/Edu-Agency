import Link from "next/link";

import { ProgramCompareCheckbox } from "@/components/marketing/program-compare";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import {
  programCountryLabels,
  programLevelLabels,
} from "@/lib/programs-labels";
import type { PublicProgramCard } from "@/lib/programs-public";

type ProgramCardProps = {
  program: PublicProgramCard;
  locale: Locale;
  dict: Dictionary;
};

export function ProgramCard({ program, locale, dict }: ProgramCardProps) {
  const href = localizedHref(`/programs/${program.id}`, locale);
  const intake = program.intakeMonths?.filter(Boolean) ?? [];

  return (
    <article className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-2xs transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="font-utility rounded-full border border-orange-200 bg-orange-50 px-3 py-0.5 text-[0.68rem] font-bold tracking-[0.12em] text-orange-700 uppercase">
          {programCountryLabels[program.country]} ·{" "}
          {programLevelLabels[program.level]}
        </span>
        <ProgramCompareCheckbox
          programId={program.id}
          programName={program.universityName}
        />
      </div>
      <h2 className="font-heading mt-3 text-xl font-bold tracking-tight text-slate-900">
        {program.universityName}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{program.field}</p>
      <dl className="mt-4 space-y-1 text-sm">
        <div>
          <dt className="sr-only">{dict.programs.tuitionLabel}</dt>
          <dd className="font-bold text-slate-900 tabular-nums">
            {program.tuitionAmount} {program.tuitionCurrency}
          </dd>
        </div>
        {intake.length > 0 ? (
          <div>
            <dt className="sr-only">{dict.programs.intakeLabel}</dt>
            <dd className="text-xs text-slate-500">{intake.join(", ")}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-6 border-t border-stone-100 pt-3">
        <Link
          href={href}
          className="btn-secondary-glass focus-ring inline-flex min-h-10 items-center justify-center rounded-full px-5 text-xs font-bold text-slate-800 shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
        >
          {dict.programs.viewProgram} →
          <span className="sr-only">: {program.universityName}</span>
        </Link>
      </div>
    </article>
  );
}
