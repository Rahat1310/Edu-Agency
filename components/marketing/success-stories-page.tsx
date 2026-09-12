"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { MarketingEmptyState } from "@/components/marketing/empty-state";
import { MarketingErrorState } from "@/components/marketing/error-state";
import {
  MarketingPreviewBar,
  useMarketingPreview,
} from "@/components/marketing/preview";
import { SuccessStoriesGridSkeleton } from "@/components/marketing/skeleton";
import { SuccessStoryCard } from "@/components/marketing/success-story-card";
import type { ProgramCountry } from "@/db/schema";
import {
  DESTINATION_SLUGS,
  destinationSlugFromCountry,
} from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import type { SuccessStoryView } from "@/lib/success-stories/featured";
import { cn } from "@/lib/utils";

type SuccessStoriesPageProps = {
  locale: Locale;
  dict: Dictionary;
  destination: ProgramCountry | "";
  stories: SuccessStoryView[];
};

export function SuccessStoriesPage({
  locale,
  dict,
  destination,
  stories,
}: SuccessStoriesPageProps) {
  const { preview, setPreview } = useMarketingPreview();
  const copy = dict.successStories;
  const selectedSlug = destination
    ? destinationSlugFromCountry(destination)
    : "";
  const visibleStories = preview === "empty" ? [] : stories;
  const isFiltered = Boolean(destination);

  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <MarketingPreviewBar preview={preview} onChange={setPreview} />
        <div className="eyebrow-pill mt-4 inline-flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span>{copy.eyebrow}</span>
        </div>
        <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.1] font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.05]">
          {copy.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 font-normal text-slate-600">
          {copy.body}
        </p>

        <nav aria-label={copy.filterAria} className="mt-10">
          <ul className="flex flex-wrap gap-2">
            <li>
              <FilterLink
                href={localizedHref("/success-stories", locale)}
                current={!destination}
              >
                {copy.allDestinations}
              </FilterLink>
            </li>
            {DESTINATION_SLUGS.map((slug) => (
              <li key={slug}>
                <FilterLink
                  href={localizedHref(
                    `/success-stories?destination=${slug}`,
                    locale,
                  )}
                  current={selectedSlug === slug}
                >
                  {dict.destinations[slug].name}
                </FilterLink>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-4 text-sm text-slate-500">
          {visibleStories.length === 0
            ? copy.countZero
            : visibleStories.length === 1
              ? copy.countOne
              : copy.countMany.replace("{n}", String(visibleStories.length))}
        </p>

        {preview === "loading" ? (
          <SuccessStoriesGridSkeleton label={copy.loadingAria} />
        ) : preview === "error" ? (
          <MarketingErrorState
            className="mt-10"
            title={copy.errorTitle}
            body={copy.errorBody}
            retryLabel={dict.common.tryAgain}
            onRetry={() => setPreview("off")}
          />
        ) : visibleStories.length === 0 ? (
          <MarketingEmptyState
            className="mt-10"
            title={isFiltered ? copy.emptyFilteredTitle : copy.emptyTitle}
            body={isFiltered ? copy.emptyFiltered : copy.empty}
            action={
              isFiltered ? (
                <Link
                  href={localizedHref("/success-stories", locale)}
                  className="btn-secondary-glass focus-ring inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold text-slate-800 shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
                >
                  {copy.allDestinations}
                </Link>
              ) : (
                <Link
                  href={localizedHref("/contact", locale)}
                  className="btn-sunset focus-ring inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  {copy.contactCta}
                </Link>
              )
            }
          />
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {visibleStories.map((story) => (
              <li key={story.id}>
                <SuccessStoryCard story={story} dict={dict} locale={locale} />
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10">
          <Link
            href={localizedHref("/contact", locale)}
            className="btn-sunset focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            {copy.contactCta}
          </Link>
        </p>
      </PageShell>
    </section>
  );
}

function FilterLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "focus-ring inline-flex min-h-9 items-center rounded-full px-4 text-xs font-bold transition-all",
        current
          ? "btn-sunset text-white shadow-xs"
          : "btn-secondary-glass text-slate-800 hover:border-orange-300 hover:text-orange-600",
      )}
    >
      {children}
    </Link>
  );
}
