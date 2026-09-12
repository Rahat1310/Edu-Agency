"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { refreshProgramMatches } from "@/app/portal/matches/actions";
import { DeskPreviewBar, useDeskPreview } from "@/components/desk/preview";
import { MatchCard } from "@/components/portal/match-card";
import { MatchProfileForm } from "@/components/portal/match-profile-form";
import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { PortalErrorState } from "@/components/portal/portal-error-state";
import {
  PortalMatchesSkeleton,
  PortalMatchRankingSkeleton,
} from "@/components/portal/portal-skeletons";
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
  const { preview, setPreview } = useDeskPreview();
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [rankingPending, startRanking] = useTransition();
  const whatsappHref = getWhatsAppHref(
    `Hi, I'm ${studentName}. I want to talk through the programs that came up for my file.`,
  );

  if (preview === "loading") {
    return (
      <div className="space-y-3">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <PortalMatchesSkeleton />
      </div>
    );
  }

  if (preview === "error") {
    return (
      <div className="space-y-3">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <div className="mx-auto max-w-2xl">
          <PortalErrorState
            title="We couldn't load your matches"
            body="Your file is still here. Try again, or WhatsApp us if this keeps happening."
            onRetry={() => setPreview("off")}
          />
        </div>
      </div>
    );
  }

  const visibleRanking = preview === "empty" ? emptyPreviewRanking() : ranking;

  return (
    <div className="space-y-3">
      <DeskPreviewBar preview={preview} onChange={setPreview} />
      <div className="mx-auto max-w-2xl">
        <p className="font-utility text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--brand-green)] uppercase">
          Matches
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--desk-accent)]">
          Programs that fit this file
        </h1>
        <p className="mt-2 text-base leading-7 text-[var(--desk-ink-muted)]">
          We filter the published directory first — destination, level, and
          tuition band — then rank a short list. This is not an offer, and it is
          not an admission or scholarship score.
        </p>

        <section className="mt-8 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
            Your matching details
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--desk-ink-muted)]">
            Education, destinations, scores, and budget. Saving this writes it
            to your file and rebuilds the list.
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

        {preview === "empty" || hasCompleteProfile || rankingPending ? (
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

function emptyPreviewRanking(): PortalMatchRanking {
  return {
    matches: [],
    shortlistCount: 0,
    cached: false,
    emptyShortlist: true,
  };
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
          title="Nothing in the directory passed the hard filters"
          body="That usually means the published programs don't match this destination, level, or tuition band yet. Widen the destinations, or WhatsApp us and we'll look by hand."
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
