import Link from "next/link";

import { DestinationCard } from "@/components/marketing/destination-card";
import { DestinationIntakeBlock } from "@/components/marketing/destination-intake-block";
import { PageShell } from "@/components/layout/page-shell";
import {
  DESTINATIONS,
  DESTINATION_SLUGS,
  preDeparturePath,
  type DestinationSlug,
} from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import type { UpcomingIntakeCountdown } from "@/lib/intakes/countdown";

type DestinationPageProps = {
  locale: Locale;
  slug: DestinationSlug;
  dict: Dictionary;
  countdown?: UpcomingIntakeCountdown | null;
};

export function DestinationPage({
  locale,
  slug,
  dict,
  countdown,
}: DestinationPageProps) {
  const destination = DESTINATIONS[slug];
  const copy = dict.destinations[slug];
  const programsHref = localizedHref(`/programs?country=${slug}`, locale);
  const quizHref = localizedHref(
    `/eligibility-quiz?destination=${slug}`,
    locale,
  );
  const arrivalHref = localizedHref(preDeparturePath(slug), locale);
  const others = DESTINATION_SLUGS.filter((item) => item !== slug);

  return (
    <>
      <section className="ambient-glow-mesh relative overflow-hidden pt-10 pb-12 sm:pt-16 sm:pb-16">
        <PageShell>
          <div className="eyebrow-pill inline-flex items-center gap-2">
            <span
              className="size-2 rounded-full ring-2 ring-white"
              style={{ backgroundColor: destination.color }}
              aria-hidden="true"
            />
            <span>
              {destination.code} · {copy.name}
            </span>
          </div>

          <h1 className="font-heading mt-5 max-w-3xl text-4xl leading-[1.1] font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.05]">
            {copy.tagline}
          </h1>

          <DestinationIntakeBlock
            className="mt-8"
            countdown={countdown}
            destinationName={copy.name}
            dict={dict}
          />
        </PageShell>
      </section>

      <section className="border-t border-stone-200 bg-gradient-to-b from-white to-slate-50 py-16 sm:py-24">
        <PageShell className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
          <div>
            <h2 className="font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {dict.destination.overview}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 font-normal text-slate-600">
              {copy.overview}
            </p>

            <h2 className="font-heading mt-14 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {dict.destination.whyTitle}
            </h2>
            <ul className="mt-6 max-w-2xl space-y-4 text-base leading-8 text-slate-600">
              {copy.why.map((reason, idx) => (
                <li
                  key={reason}
                  className="glass-panel flex items-start gap-3.5 rounded-2xl p-4 shadow-2xs"
                >
                  <span className="font-utility mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="glass-panel relative h-fit overflow-hidden rounded-3xl p-7 shadow-xl">
            <div
              className="absolute top-0 right-0 left-0 h-1.5"
              style={{ backgroundColor: destination.color }}
            />
            <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
              {dict.destination.visaTitle}
            </h2>
            <div className="font-utility mt-3 inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 uppercase shadow-2xs">
              {destination.visaLabel}
            </div>
            <p className="mt-3 text-lg font-bold text-slate-900">
              {copy.visaName}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {copy.visaSummary}
            </p>
            <ol className="mt-5 space-y-2.5 pl-1 text-sm leading-6 text-slate-700">
              {copy.visaSteps.map((step, idx) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="font-utility mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[0.68rem] font-bold text-orange-700">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-slate-200 pt-4">
              <Link
                href={arrivalHref}
                className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700"
              >
                <span>{dict.preDeparture.teaserCta}</span>
                <span>→</span>
              </Link>
            </div>
          </aside>
        </PageShell>
      </section>

      <section className="bg-slate-50 py-16 sm:py-24">
        <PageShell>
          <h2 className="font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {dict.destination.fieldsTitle}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {copy.fields.map((field) => (
              <li
                key={field.name}
                className="glass-panel-interactive rounded-2xl p-6 shadow-xs"
              >
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {field.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {field.note}
                </p>
              </li>
            ))}
          </ul>
        </PageShell>
      </section>

      <section className="border-t border-stone-200 bg-white py-16 sm:py-24">
        <PageShell>
          <div className="glass-panel rounded-3xl p-8 shadow-md sm:p-12">
            <h2 className="font-heading max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {dict.preDeparture.teaserTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              {dict.preDeparture.teaserBody}
            </p>
            <Link
              href={arrivalHref}
              className="btn-sunset focus-ring mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              {dict.preDeparture.teaserCta}
              <span className="sr-only">: {copy.name}</span>
            </Link>
          </div>
        </PageShell>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1E36] via-[#102B4E] to-[#071324] py-20 text-white sm:py-24">
        <PageShell>
          <h2 className="font-heading max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
            {dict.destination.ctaTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">
            {dict.destination.ctaBody}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={programsHref}
              className="btn-sunset focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              {dict.common.browsePrograms}
              <span className="sr-only">: {copy.name}</span>
            </Link>
            <Link
              href={quizHref}
              className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
            >
              {dict.destination.quizCta}
            </Link>
          </div>
        </PageShell>
      </section>

      <section className="bg-[var(--brand-sky)] py-16 sm:py-24">
        <PageShell>
          <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
            {dict.destination.otherTitle}
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {others.map((item) => (
              <li key={item}>
                <DestinationCard
                  destination={DESTINATIONS[item]}
                  locale={locale}
                  dict={dict}
                />
              </li>
            ))}
          </ul>
        </PageShell>
      </section>
    </>
  );
}
