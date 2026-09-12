import Link from "next/link";

import { localizedHref } from "@/lib/i18n/paths";
import type { RankedMatch } from "@/lib/matching/types";
import {
  programCountryLabels,
  programLevelLabels,
} from "@/lib/programs-labels";

export function MatchCard({ match }: { match: RankedMatch }) {
  const href = localizedHref(`/programs/${match.id}`, "en");

  return (
    <article className="rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
      <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
        <span className="sr-only">Match {match.rank}: </span>
        {match.universityName}
      </h3>
      <p className="font-utility mt-1 text-[0.68rem] font-semibold tracking-[0.08em] text-[var(--desk-ink-muted)] uppercase">
        {programCountryLabels[match.country]} ·{" "}
        {programLevelLabels[match.level]}
      </p>
      <p className="mt-1 text-sm text-[var(--desk-ink)]">{match.field}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--desk-ink)] tabular-nums">
        {match.tuitionAmount} {match.tuitionCurrency}
      </p>
      <p className="mt-3 text-[0.95rem] leading-6 text-[var(--desk-ink)]">
        {match.reason}
      </p>
      <Link
        href={href}
        className="desk-focus mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-green)]"
      >
        View program
        <span className="sr-only">: {match.universityName}</span>
      </Link>
    </article>
  );
}
