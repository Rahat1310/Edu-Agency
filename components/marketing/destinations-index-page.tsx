import { DestinationCard } from "@/components/marketing/destination-card";
import { PageShell } from "@/components/layout/page-shell";
import { DESTINATIONS, DESTINATION_SLUGS } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
type DestinationsIndexPageProps = {
  locale: Locale;
  dict: Dictionary;
};
export function DestinationsIndexPage({
  locale,
  dict,
}: DestinationsIndexPageProps) {
  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-blue)]">
          <span>{dict.destinationsIndex.eyebrow}</span>
        </div>
        <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.15]">
          {dict.destinationsIndex.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 font-normal text-slate-600">
          {dict.destinationsIndex.lede}
        </p>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {DESTINATION_SLUGS.map((slug) => (
            <li key={slug}>
              <DestinationCard
                destination={DESTINATIONS[slug]}
                locale={locale}
                dict={dict}
              />
            </li>
          ))}
        </ul>
      </PageShell>
    </section>
  );
}
