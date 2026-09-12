"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageShell } from "@/components/layout/page-shell";
import {
  isDestinationSlug,
  type DestinationSlug,
} from "@/lib/destinations";
import type { Dictionary } from "@/lib/i18n/types";

type SimplePlaceholderPageProps = {
  dict: Dictionary;
  title: string;
  body: string;
  showCountryFilter?: boolean;
};

function CountryFilterNote({ dict }: { dict: Dictionary }) {
  const searchParams = useSearchParams();
  const country = searchParams.get("country");

  if (!country || !isDestinationSlug(country)) {
    return (
      <p className="mt-6 text-sm leading-6 text-[var(--muted-foreground)]">
        {dict.programs.noFilter}
      </p>
    );
  }

  const name = dict.destinations[country as DestinationSlug].name;

  return (
    <p className="mt-6 text-sm leading-6 text-[var(--brand-navy)]">
      <span className="font-utility mr-2 tracking-[0.08em] uppercase">
        {dict.programs.filterLabel}:
      </span>
      {name}
    </p>
  );
}

export function SimplePlaceholderPage({
  dict,
  title,
  body,
  showCountryFilter = false,
}: SimplePlaceholderPageProps) {
  return (
    <section className="py-10 sm:py-16">
      <PageShell className="max-w-3xl">
        <h1 className="font-display text-4xl font-bold tracking-[-0.045em] text-[var(--brand-navy)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-[var(--brand-ink)]/80">
          {body}
        </p>
        {showCountryFilter ? (
          <Suspense
            fallback={
              <p className="mt-6 text-sm text-[var(--muted-foreground)]">
                {dict.programs.noFilter}
              </p>
            }
          >
            <CountryFilterNote dict={dict} />
          </Suspense>
        ) : null}
      </PageShell>
    </section>
  );
}
