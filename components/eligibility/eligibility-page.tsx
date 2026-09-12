import { EligibilityQuiz } from "@/components/eligibility/eligibility-quiz";
import { PageShell } from "@/components/layout/page-shell";
import type { EligibilityDestination } from "@/lib/eligibility";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";

type EligibilityPageProps = {
  locale: Locale;
  dict: Dictionary;
  initialDestination?: EligibilityDestination;
};

export function EligibilityPage({
  locale,
  dict,
  initialDestination,
}: EligibilityPageProps) {
  return (
    <section className="py-10 sm:py-16">
      <PageShell className="max-w-3xl">
        <div className="eyebrow-pill inline-flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span>{dict.eligibility.eyebrow}</span>
        </div>
        <h1 className="font-heading mt-4 text-4xl leading-[1.1] font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.05]">
          {dict.eligibility.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 font-normal text-slate-600">
          {dict.eligibility.lede}
        </p>
        <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <EligibilityQuiz
            copy={dict.eligibility}
            locale={locale}
            initialDestination={initialDestination}
            footerNewTab={dict.chrome.footerNewTab}
          />
        </div>
      </PageShell>
    </section>
  );
}
