import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getChinaOffer } from "@/lib/china-2027";
import { ChinaOfferDetail } from "@/components/marketing/china-offer-detail";

import { PageShell } from "@/components/layout/page-shell";
import { costCalculatorHref } from "@/lib/costs/href";
import { chinaAdmissionsUrl } from "@/lib/china-admissions";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import {
  programCountryLabels,
  programLevelLabels,
} from "@/lib/programs-labels";
import type {
  PublicProgramCard,
  PublicProgramDetail,
} from "@/lib/programs-public";
import { getWhatsAppHref } from "@/lib/whatsapp";

type ProgramDetailProps = {
  program: PublicProgramDetail;
  relatedPrograms?: PublicProgramCard[];
  locale: Locale;
  dict: Dictionary;
};

export function ProgramDetail({
  program,
  relatedPrograms = [],
  locale,
  dict,
}: ProgramDetailProps) {
  const chinaOffer = getChinaOffer(program.id);
  if (chinaOffer)
    return <ChinaOfferDetail offer={chinaOffer} locale={locale} />;
  const intake = program.intakeMonths?.filter(Boolean) ?? [];
  const countryName = programCountryLabels[program.country];
  const levelName = programLevelLabels[program.level];

  const whatsappMessage = `Hello, I would like guidance about studying ${program.field} at ${program.universityName} in ${countryName}. Please evaluate my academic eligibility.`;
  const whatsappHref = getWhatsAppHref(whatsappMessage);

  return (
    <article className="py-10 sm:py-16">
      <PageShell className="max-w-4xl">
        {/* Breadcrumb / Navigation */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link
            href={localizedHref("/programs", locale)}
            className="focus-ring rounded-md font-bold text-orange-600 hover:text-orange-700"
          >
            {dict.programs.backToDirectory}
          </Link>
          <span>/</span>
          <Link
            href={localizedHref(`/programs?country=${program.country}`, locale)}
            className="focus-ring rounded-md font-medium text-slate-600 hover:text-slate-900"
          >
            {countryName}
          </Link>
          <span>/</span>
          <span className="truncate text-slate-400">
            {program.universityName}
          </span>
        </div>

        {/* Header Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <span className="font-utility rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold tracking-wider text-orange-700 uppercase">
            {countryName} · {levelName}
          </span>
          <span className="font-utility rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {program.country === "china"
              ? locale === "bn"
                ? "চীনে পড়াশোনার বিকল্প"
                : "China study option"
              : "Verified Partner Campus"}
          </span>
        </div>

        {/* University & Degree Title */}
        <h1 className="font-heading mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
          {program.universityName}
        </h1>
        <p className="mt-3 text-xl font-bold text-orange-600 sm:text-2xl">
          {program.field}
        </p>
        {program.country === "china" ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
            <p>
              {locale === "bn"
                ? "এটি আগের তালিকার তথ্য। এই প্রোগ্রামের ২০২৭-এর ফি বা প্রাপ্যতা যাচাই করা হয়নি।"
                : "This is an older listing. Its 2027 availability and fees have not been verified."}
            </p>
            <Link
              href={localizedHref("/programs?country=china", locale)}
              className="focus-ring mt-2 inline-flex min-h-11 items-center font-bold underline"
            >
              {locale === "bn"
                ? "বর্তমান ২০২৭-এর অফার দেখুন"
                : "Explore the current 2027 offers"}{" "}
              →
            </Link>
          </div>
        ) : null}

        {program.country === "china" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            <p>
              {locale === "bn"
                ? "তালিকাভুক্ত ফি পরিকল্পনার জন্য। নির্দিষ্ট কোর্সের নাম, পাঠদানের ভাষা, বর্তমান ফি, আবেদনের শেষ তারিখ ও স্কলারশিপ বিশ্ববিদ্যালয়ের লিখিত অফার দিয়ে নিশ্চিত করুন।"
                : "Listed fees are for planning. Confirm the exact degree title, teaching language, current tuition, application deadline and scholarship terms against the university’s written offer."}
            </p>
            <a
              href={chinaAdmissionsUrl(program.universityName, program.level)}
              className="focus-ring mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-orange-700"
            >
              {locale === "bn"
                ? "অফিসিয়াল বিশ্ববিদ্যালয়ের তথ্য"
                : "Check official admissions information"}
              <ArrowRight className="size-4" />
            </a>
          </div>
        )}

        {/* Key Metrics: Tuition & Intake */}
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
            <dt className="font-utility text-xs font-bold tracking-wider text-slate-500 uppercase">
              {dict.programs.tuitionLabel}{" "}
              {program.country === "china"
                ? locale === "bn"
                  ? "(আনুমানিক বার্ষিক)"
                  : "(Annual estimate)"
                : locale === "bn"
                  ? "(বার্ষিক)"
                  : "(Annual)"}
            </dt>
            <dd className="mt-2">
              <p className="font-heading text-2xl font-black text-slate-900 tabular-nums">
                {program.tuitionAmount}{" "}
                <span className="text-base font-bold text-slate-600">
                  {program.tuitionCurrency}
                </span>
              </p>
              <Link
                href={costCalculatorHref(locale, {
                  destination: program.country,
                  level: program.level,
                  programId: program.id,
                })}
                className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                <span>{dict.programs.estimateCosts}</span>
                <span>→</span>
              </Link>
            </dd>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
            <dt className="font-utility text-xs font-bold tracking-wider text-slate-500 uppercase">
              {dict.programs.intakeLabel}
            </dt>
            <dd className="mt-2">
              <p className="font-heading text-2xl font-black text-slate-900">
                {intake.length > 0
                  ? intake.join(", ")
                  : locale === "bn"
                    ? "নিশ্চিত করুন"
                    : "To be confirmed"}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                {program.country === "china"
                  ? locale === "bn"
                    ? "নির্দিষ্ট প্রোগ্রাম ও স্কলারশিপের বর্তমান সময়সীমা নিশ্চিত করুন।"
                    : "Confirm the current deadline for your program and scholarship route."
                  : "Applications open 4-6 months prior to session commencement"}
              </p>
            </dd>
          </div>
        </dl>

        {/* Requirements & Academic Criteria */}
        {program.requirements ? (
          <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs sm:p-8">
            <h2 className="font-heading text-xl font-bold text-slate-900 sm:text-2xl">
              {dict.programs.requirementsLabel}
            </h2>
            <p className="mt-4 text-base leading-8 whitespace-pre-wrap text-slate-700">
              {program.requirements}
            </p>
          </section>
        ) : null}

        {/* Scholarships & Merit Waivers */}
        {program.scholarshipInfo ? (
          <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-2xs sm:p-8">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-600" />
              <h2 className="font-heading text-xl font-bold text-emerald-950 sm:text-2xl">
                {dict.programs.scholarshipLabel}
              </h2>
            </div>
            <p className="mt-4 text-base leading-8 whitespace-pre-wrap text-emerald-900">
              {program.scholarshipInfo}
            </p>
          </section>
        ) : null}

        {/* Lead Action CTA Card */}
        <div className="mt-10 rounded-3xl bg-gradient-to-br from-[#0B1E36] via-[#102B4E] to-[#071324] p-8 text-white shadow-xl sm:p-10">
          <p className="font-utility text-xs font-bold tracking-widest text-orange-300 uppercase">
            {locale === "bn"
              ? "ভর্তি সহায়তা · প্রোফাইল মূল্যায়ন"
              : "Admissions desk · Profile assessment"}
          </p>
          <h2 className="font-heading mt-2 text-2xl font-black sm:text-3xl">
            {locale === "bn"
              ? `${program.universityName}-এ আবেদন করতে চান?`
              : `Want to apply to ${program.universityName}?`}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            {locale === "bn"
              ? "আপনার শিক্ষাগত যোগ্যতা ও বাজেট নিয়ে কাউন্সেলরের সঙ্গে কথা বলুন। আমরা কোর্সের শর্ত মিলিয়ে সম্ভাব্য স্কলারশিপ ও আবেদনের পরবর্তী ধাপ বুঝতে সাহায্য করব। চূড়ান্ত ভর্তি ও বৃত্তির সিদ্ধান্ত বিশ্ববিদ্যালয় নেয়।"
              : "Discuss your academic background and budget with a counsellor. We’ll help you check course requirements, explore scholarships and plan your application. The university makes the final admission and scholarship decisions."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/portal/application"
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-bold text-slate-900"
            >
              {locale === "bn" ? "আবেদন শুরু করুন" : "Start your application"}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn-sunset focus-ring inline-flex min-h-12 items-center gap-2.5 rounded-full px-7 text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              <span>
                {locale === "bn"
                  ? "হোয়াটসঅ্যাপে কথা বলুন"
                  : "Message on WhatsApp"}
              </span>
            </a>
            <Link
              href={localizedHref(`/contact`, locale)}
              className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold text-white shadow-xs hover:border-orange-300 hover:bg-white hover:text-slate-900"
            >
              {locale === "bn" ? "অফিস ভিজিটের তথ্য" : "Plan an office visit"}
            </Link>
          </div>
        </div>

        {/* Other Programs & Available Majors at this University */}
        {relatedPrograms.length > 0 ? (
          <section className="mt-14 border-t border-stone-200 pt-10">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-utility text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Available Degrees & Faculties
                </p>
                <h2 className="font-heading mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                  Other Programs at {program.universityName}
                </h2>
              </div>
              <Link
                href={localizedHref(
                  `/programs?country=${program.country}`,
                  locale,
                )}
                className="hidden text-sm font-bold text-orange-600 hover:text-orange-700 sm:inline-flex"
              >
                All {countryName} Programs →
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {relatedPrograms.map((rel) => {
                const relIntake = rel.intakeMonths?.filter(Boolean) ?? [];
                return (
                  <Link
                    key={rel.id}
                    href={localizedHref(`/programs/${rel.id}`, locale)}
                    className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-utility rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-orange-700 uppercase">
                        {programLevelLabels[rel.level]}
                      </span>
                      <ArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-orange-600" />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-orange-600">
                      {rel.field}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-slate-800">
                        {rel.tuitionAmount} {rel.tuitionCurrency} / year
                      </span>
                      <span>
                        {relIntake.length > 0 ? relIntake.join(", ") : "Intake"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </PageShell>
    </article>
  );
}
