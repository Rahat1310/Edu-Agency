import { SectionHeading } from "@/components/marketing/section-heading";
import { PageShell } from "@/components/layout/page-shell";
import type { Dictionary } from "@/lib/i18n/types";

type AboutPageProps = {
  dict: Dictionary;
};

export function AboutPage({ dict }: AboutPageProps) {
  return (
    <>
      <section className="pt-10 pb-12 sm:pt-16 sm:pb-16">
        <PageShell>
          <div className="eyebrow-pill inline-flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span>{dict.about.eyebrow}</span>
          </div>
          <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.1] font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.05]">
            {dict.about.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 font-normal text-slate-600">
            {dict.about.lede}
          </p>
        </PageShell>
      </section>

      <section className="border-t border-stone-200 py-16 sm:py-20">
        <PageShell>
          <SectionHeading
            eyebrow={dict.about.founderEyebrow}
            title={dict.about.founderTitle}
          />
          <div className="mt-8 max-w-2xl space-y-5 text-base leading-8 text-slate-600">
            {dict.about.founderBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </PageShell>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <PageShell>
          <SectionHeading
            eyebrow={dict.about.missionEyebrow}
            title={dict.about.missionTitle}
          />
          <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600">
            {dict.about.missionBody}
          </p>
        </PageShell>
      </section>

      <section className="border-t border-stone-200 py-16 sm:py-20">
        <PageShell>
          <SectionHeading
            eyebrow={dict.about.trustEyebrow}
            title={dict.about.trustTitle}
          />
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {dict.about.trustSignals.map((signal) => (
              <li
                key={signal.title}
                className="rounded-3xl border border-stone-200 bg-white p-6 shadow-2xs transition-all hover:shadow-md"
              >
                <h3 className="font-heading text-xl font-bold tracking-tight text-slate-900">
                  {signal.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {signal.body}
                </p>
              </li>
            ))}
          </ul>
        </PageShell>
      </section>
    </>
  );
}
