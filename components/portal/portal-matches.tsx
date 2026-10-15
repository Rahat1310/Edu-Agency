"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { refreshProgramMatches } from "@/app/portal/matches/actions";
import { MatchCard } from "@/components/portal/match-card";
import { MatchProfileForm } from "@/components/portal/match-profile-form";
import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { PortalErrorState } from "@/components/portal/portal-error-state";
import { PortalMatchRankingSkeleton } from "@/components/portal/portal-skeletons";
import type {
  MatchProfileDraft,
  PortalMatchRanking,
} from "@/lib/matching/types";
import { getWhatsAppHref } from "@/lib/whatsapp";
export type { PortalMatchRanking };
type PortalMatchesProps = {
  studentName: string;
  draft: MatchProfileDraft;
  hasCompleteProfile: boolean;
  ranking: PortalMatchRanking | null;
};
export function PortalMatches({
  studentName,
  draft,
  hasCompleteProfile,
  ranking,
}: PortalMatchesProps) {
  const router = useRouter();
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [rankingPending, startRanking] = useTransition();
  const whatsappHref = getWhatsAppHref(
    `Hi, I'm ${studentName}. I want to talk through the programs that came up for my file.`,
  );
  const visibleRanking = ranking;
  return (
    <div className="space-y-3">
      <div className="mx-auto max-w-2xl">
        <p className="font-utility text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--brand-green)] uppercase">
          Matches
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--desk-accent)]">
          Suggested programmes
        </h1>
        <p className="mt-2 text-base leading-7 text-[var(--desk-ink-muted)]">
          These suggestions use your destination, education level, and tuition
          budget. Check the entry requirements with a counsellor before
          applying.
        </p>

        <section className="mt-8 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
            Your matching details
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--desk-ink-muted)]">
            Update your education, preferred destinations, test scores, and
            budget to refresh your suggestions.
          </p>
          <div className="mt-5">
            <MatchProfileForm
              draft={draft}
              pending={rankingPending}
              startPending={startRanking}
              onSaved={() => {
                setRefreshError(null);
                router.refresh();
              }}
            />
          </div>
        </section>

        {hasCompleteProfile || rankingPending ? (
          <section className="mt-6" aria-busy={rankingPending}>
            <div className="flex flex-wrap items-end justify-between gap-3 px-1">
              <h2
                id="ranked-matches-heading"
                className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]"
              >
                Ranked for you
              </h2>
              <button
                type="button"
                disabled={rankingPending}
                className="desk-focus desk-press inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] px-4 text-sm font-semibold text-[var(--desk-ink)] disabled:opacity-60"
                onClick={() => {
                  setRefreshError(null);
                  startRanking(async () => {
                    const result = await refreshProgramMatches();
                    if (result.error) {
                      setRefreshError(result.error);
                      return;
                    }
                    router.refresh();
                  });
                }}
              >
                {rankingPending ? "Ranking…" : "Refresh matches"}
              </button>
            </div>
            {refreshError ? (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-4 py-3 text-sm text-[var(--desk-ink)]"
              >
                {refreshError}
              </p>
            ) : null}
            {rankingPending ? (
              <PortalMatchRankingSkeleton />
            ) : (
              <MatchResults
                ranking={visibleRanking}
                whatsappHref={whatsappHref}
                onRetry={() => router.refresh()}
              />
            )}
          </section>
        ) : (
          <div className="mt-6">
            <PortalEmptyState
              title="Save your education, destination, and budget first"
              body="Once those three are on the file, we can filter the directory and rank a short list. Scores help, but they are optional."
            />
          </div>
        )}
      </div>
    </div>
  );
}
function MatchResults({
  ranking,
  whatsappHref,
  onRetry,
}: {
  ranking: PortalMatchRanking | null;
  whatsappHref: string;
  onRetry: () => void;
}) {
  if (!ranking) {
    return null;
  }
  if (ranking.error) {
    return (
      <div className="mt-4">
        <PortalErrorState
          title="We couldn't rank programs just now"
          body={ranking.error}
          onRetry={onRetry}
        />
      </div>
    );
  }
  if (ranking.emptyShortlist || ranking.matches.length === 0) {
    return (
      <div className="mt-4">
        <PortalEmptyState
          title="No programmes match your preferences"
          body="Try another destination or budget range, or contact us on WhatsApp for help finding a programme."
          action={
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="desk-focus desk-press inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] px-4 text-sm font-semibold text-[var(--desk-ink)]"
            >
              WhatsApp us
            </a>
          }
        />
      </div>
    );
  }
  return (
    <div>
      <ol
        aria-labelledby="ranked-matches-heading"
        className="mt-4 list-none space-y-3"
      >
        {ranking.matches.map((match) => (
          <li key={match.id}>
            <MatchCard match={match} />
          </li>
        ))}
      </ol>
      <p className="mt-3 px-1 text-sm text-[var(--desk-ink-muted)]">
        Ranked from {ranking.shortlistCount} published programs that passed the
        filters
        {ranking.cached ? " · showing the saved list" : null}.
      </p>
    </div>
  );
}
