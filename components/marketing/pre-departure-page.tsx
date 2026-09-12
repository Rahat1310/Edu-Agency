"use client";

import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { MarketingEmptyState } from "@/components/marketing/empty-state";
import { MarketingErrorState } from "@/components/marketing/error-state";
import {
  MarketingPreviewBar,
  useMarketingPreview,
} from "@/components/marketing/preview";
import { DestinationPageSkeleton } from "@/components/marketing/skeleton";
import { DESTINATIONS, type DestinationSlug } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";

type PreDeparturePageProps = {
  locale: Locale;
  slug: DestinationSlug;
  dict: Dictionary;
};

export function PreDeparturePage({
  locale,
  slug,
  dict,
}: PreDeparturePageProps) {
  const { preview, setPreview } = useMarketingPreview();
  const destination = DESTINATIONS[slug];
  const copy = dict.destinations[slug];
  const brief = copy.preDeparture;
  const destinationHref = localizedHref(`/destinations/${slug}`, locale);
  const blocks = [
    {
      title: dict.preDeparture.accommodationTitle,
      body: brief.accommodation,
    },
    {
      title: dict.preDeparture.airportTitle,
      body: brief.airport,
    },
    {
      title: dict.preDeparture.simBankTitle,
      body: brief.simBank,
    },
    {
      title: dict.preDeparture.orientationTitle,
      body: brief.orientation,
    },
  ] as const;

  if (preview === "loading") {
    return (
      <div>
        <PageShell className="pt-10 sm:pt-16">
          <MarketingPreviewBar preview={preview} onChange={setPreview} />
        </PageShell>
        <DestinationPageSkeleton label={dict.preDeparture.loadingAria} />
      </div>
    );
  }

  if (preview === "error") {
    return (
      <section className="py-10 sm:py-16">
        <PageShell>
          <MarketingPreviewBar preview={preview} onChange={setPreview} />
          <div className="mt-6">
            <MarketingErrorState
              title={dict.preDeparture.errorTitle}
              body={dict.preDeparture.errorBody}
              retryLabel={dict.common.tryAgain}
              onRetry={() => setPreview("off")}
            />
          </div>
        </PageShell>
      </section>
    );
  }

  return (
    <>
      <section className="pt-10 pb-12 sm:pt-16 sm:pb-16">
        <PageShell>
          <MarketingPreviewBar preview={preview} onChange={setPreview} />
          <div className="eyebrow-pill mt-4 inline-flex items-center gap-2">
            <span
              className="size-2 rounded-full ring-2 ring-white"
              style={{ backgroundColor: destination.color }}
              aria-hidden="true"
            />
            <span>
              {destination.code} · {dict.preDeparture.eyebrow}
            </span>
          </div>
          <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.1] font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.05]">
            {brief.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 font-normal text-slate-600">
            {brief.lede}
          </p>
          <p className="mt-6">
            <Link
              href={destinationHref}
              className="btn-secondary-glass focus-ring inline-flex min-h-11 items-center px-5 text-sm font-bold text-slate-800 shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
            >
              ←{" "}
              {dict.preDeparture.backToDestination.replace("{name}", copy.name)}
            </Link>
          </p>
        </PageShell>
      </section>

      <section className="border-t border-stone-200 py-16 sm:py-20">
        <PageShell>
          {preview === "empty" ? (
            <MarketingEmptyState
              title={dict.preDeparture.emptyTitle}
              body={dict.preDeparture.emptyBody}
            />
          ) : (
            <ol className="grid gap-6 lg:grid-cols-2">
              {blocks.map((block) => (
                <li key={block.title}>
                  <article className="h-full rounded-3xl border border-stone-200 bg-white p-6 shadow-2xs transition-all hover:shadow-md">
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
                      {block.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {block.body}
                    </p>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </PageShell>
      </section>
    </>
  );
}
