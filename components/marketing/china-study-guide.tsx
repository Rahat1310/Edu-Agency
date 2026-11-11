import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Languages,
  MapPin,
  MoveUpRight,
  Wallet,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { DestinationIntakeBlock } from "@/components/marketing/destination-intake-block";
import {
  CountryFlagBadge,
  CountryWatermark,
} from "@/components/marketing/destination-watermarks";
import { costCalculatorHref } from "@/lib/costs/href";
import { chinaAdmissionsUrl } from "@/lib/china-admissions";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import type { UpcomingIntakeCountdown } from "@/lib/intakes/countdown";
import { FEATURED_UNIVERSITIES } from "@/lib/universities-data";
import { publicProgramsHref } from "@/lib/programs-href";

export function ChinaDestinationIntro({
  locale,
  dict,
  countdown,
}: {
  locale: Locale;
  dict: Dictionary;
  countdown?: UpcomingIntakeCountdown | null;
}) {
  const bn = locale === "bn";
  const facts = [
    {
      icon: GraduationCap,
      title: bn ? "ডিগ্রি ও ভাষা শিক্ষা" : "Degrees & language study",
      detail: bn
        ? "স্নাতক, উচ্চশিক্ষা ও প্রস্তুতি"
        : "Undergraduate, postgraduate & preparation",
    },
    {
      icon: Languages,
      title: bn ? "ইংরেজি / চীনা মাধ্যম" : "English / Chinese",
      detail: bn
        ? "প্রোগ্রাম অনুযায়ী ভাষার যোগ্যতা"
        : "Language requirements vary by program",
    },
    {
      icon: CalendarDays,
      title: bn ? "ইনটেক অনুযায়ী পরিকল্পনা" : "Plan around your intake",
      detail: bn
        ? "বিশ্ববিদ্যালয়ের সময়সীমা মিলিয়ে নিন"
        : "Check each university’s application calendar",
    },
  ];
  return (
    <section className="relative isolate overflow-hidden border-b border-red-100 bg-[#fff9f5] pt-10 pb-12 sm:pt-16 sm:pb-16">
      <div
        className="pointer-events-none absolute -top-28 -right-28 size-[32rem] rounded-full bg-red-100/60 blur-3xl"
        aria-hidden="true"
      />
      <PageShell className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-red-800">
              <CountryFlagBadge slug="china" />
              {bn
                ? "বাংলাদেশ থেকে চীনে পড়াশোনা"
                : "STUDY IN CHINA · FROM BANGLADESH"}
            </div>
            <h1 className="font-heading mt-6 max-w-3xl text-4xl leading-[1.12] font-semibold tracking-tight text-slate-900 sm:text-6xl">
              {bn
                ? "আপনার লক্ষ্য থেকে চীনের ক্যাম্পাসে।"
                : "Your ambition. A campus in China."}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              {bn
                ? "ইঞ্জিনিয়ারিং, মেডিসিন, গবেষণা বা চীনা ভাষা—আপনার ফলাফল, বাজেট ও ভাষার দক্ষতার সঙ্গে মানানসই পথ বেছে নিন।"
                : "Explore engineering, medicine, research and Chinese language study. Find a route that fits your grades, budget and language skills."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={localizedHref("/consultation", locale)}
                className="btn-sunset focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold"
              >
                {bn
                  ? "আপনার প্রোফাইল মূল্যায়ন করুন"
                  : "Get your profile assessed"}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#china-universities"
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800"
              >
                {bn ? "বিশ্ববিদ্যালয় দেখুন" : "Explore universities"}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-[#102b4e] p-7 text-white shadow-xl sm:p-9">
            <CountryWatermark
              slug="china"
              className="pointer-events-none absolute -top-8 -right-10 h-64 w-64 opacity-15"
            />
            <div className="relative">
              <span className="text-xs font-semibold tracking-[0.16em] text-orange-200 uppercase">
                {bn ? "আপনার চীন স্টাডি প্ল্যান" : "Your China study plan"}
              </span>
              <h2 className="font-heading mt-4 text-2xl leading-snug font-semibold">
                {bn
                  ? "সঠিক কোর্স। পরিষ্কার খরচ। পরবর্তী ধাপ।"
                  : "The right course. Clear costs. A next step."}
              </h2>
              <div className="mt-7 space-y-5">
                {facts.map(({ icon: Icon, title, detail }) => (
                  <div
                    key={title}
                    className="flex gap-3 border-t border-white/15 pt-5"
                  >
                    <Icon
                      className="mt-0.5 size-5 shrink-0 text-orange-200"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-xs leading-6 text-slate-300">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <nav
          aria-label={bn ? "চীন গাইডের বিভাগ" : "China guide sections"}
          className="mt-10 flex flex-wrap gap-2 border-t border-red-200/70 pt-6"
        >
          {[
            ["#china-universities", bn ? "বিশ্ববিদ্যালয়" : "Universities"],
            [
              "#china-planning",
              bn ? "খরচ ও স্কলারশিপ" : "Costs & scholarships",
            ],
            ["#china-questions", bn ? "সাধারণ প্রশ্ন" : "Common questions"],
            [
              localizedHref("/programs?country=china", locale),
              bn ? "সব প্রোগ্রাম" : "All China programs",
            ],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href!}
              className="focus-ring rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 ring-1 ring-stone-200"
            >
              {label}
            </Link>
          ))}
        </nav>
        <DestinationIntakeBlock
          className="mt-7"
          countdown={countdown}
          destinationName={dict.destinations.china.name}
          dict={dict}
        />
      </PageShell>
    </section>
  );
}

export function ChinaStudyGuide({ locale }: { locale: Locale }) {
  const bn = locale === "bn";
  const universities = FEATURED_UNIVERSITIES.filter(
    (university) => university.country === "china",
  );
  const questions = bn
    ? [
        [
          "IELTS ছাড়া কি আবেদন করা যায়?",
          "কিছু বিশ্ববিদ্যালয় বিকল্প ইংরেজি দক্ষতার প্রমাণ গ্রহণ করতে পারে। চীনা মাধ্যমের প্রোগ্রামে সাধারণত HSK লাগে। নির্দিষ্ট প্রোগ্রামের বর্তমান শর্ত মিলিয়ে নিন।",
        ],
        [
          "স্কলারশিপ কি নিশ্চিত?",
          "স্কলারশিপ প্রতিযোগিতামূলক। কোর্স, শিক্ষার স্তর, ভাষা, কোটা ও সময়সীমা অনুযায়ী সুযোগ বদলায়। লিখিত বৃত্তির চিঠিতে টিউশন, আবাসন, ভাতা ও নবায়নের শর্ত দেখুন।",
        ],
        [
          "স্নাতক আবেদনে CSCA লাগবে?",
          "Zhejiang University-এর ২০২৬/২৭ স্নাতক নির্দেশিকায় CSCA স্কোর চাওয়া হয়েছে। আপনার বিশ্ববিদ্যালয় ও বিষয় অনুযায়ী পরীক্ষার বিষয়, ভাষা ও সময়সীমা নিশ্চিত করুন।",
        ],
        [
          "চীনের MBBS করে বাংলাদেশে প্র্যাকটিস করা যাবে?",
          "ভর্তির আগে নির্দিষ্ট বিশ্ববিদ্যালয়, কোর্স ও ইনটেকের জন্য BMDC-এর বর্তমান যোগ্যতা ও রেজিস্ট্রেশনের শর্ত যাচাই করুন। কোনো ডিরেক্টরিতে নাম থাকা নিজে থেকে স্বীকৃতি বা লাইসেন্স নিশ্চিত করে না।",
        ],
      ]
    : [
        [
          "Can I apply without IELTS?",
          "Some universities accept alternative proof of English proficiency. Chinese-taught programs usually require HSK. Check the current requirements for the exact program before applying.",
        ],
        [
          "Is a scholarship guaranteed?",
          "Awards are competitive and depend on the program, study level, teaching language, quota and deadline. Check your written award for tuition, housing, stipend and renewal conditions.",
        ],
        [
          "Do undergraduate applicants need CSCA?",
          "Zhejiang University’s 2026/27 undergraduate guide requires a CSCA score. Confirm the subjects, exam language and submission deadline for your chosen university and major.",
        ],
        [
          "Can I practise in Bangladesh after an MBBS in China?",
          "Check BMDC’s current eligibility and registration requirements for the exact university, course and intake before enrolling. A medical directory listing alone does not establish accreditation or licensing eligibility.",
        ],
      ];
  return (
    <>
      <section
        id="china-universities"
        className="scroll-mt-24 bg-white py-16 sm:py-20"
      >
        <PageShell>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.15em] text-red-700 uppercase">
                {bn ? "আপনার শর্টলিস্ট তৈরি করুন" : "Build your shortlist"}
              </p>
              <h2 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {bn
                  ? "কোন ক্যাম্পাস আপনার জন্য?"
                  : "Which campus fits your plans?"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {bn
                  ? "বিষয় ও শহর অনুযায়ী তুলনা করুন। বিশ্ববিদ্যালয়ের অফিসিয়াল ভর্তি নির্দেশিকা থেকে প্রোগ্রাম, ভাষা ও ফি মিলিয়ে নিন।"
                  : "Compare subject strengths and cities, then check the university’s official admissions guide for program availability, teaching language and fees."}
              </p>
            </div>
            <Link
              href={localizedHref("/programs?country=china", locale)}
              className="focus-ring inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-700"
            >
              {bn ? "সব চীন প্রোগ্রাম" : "Browse China programs"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div
            className="mt-7 flex flex-wrap gap-2"
            aria-label={
              bn ? "শিক্ষার স্তর অনুযায়ী প্রোগ্রাম" : "Programs by study level"
            }
          >
            {(
              [
                ["bachelor", bn ? "স্নাতক" : "Undergraduate"],
                ["master", bn ? "স্নাতকোত্তর" : "Master’s study"],
                ["language", bn ? "ভাষা শিক্ষা" : "Language study"],
              ] as const
            ).map(([level, label]) => (
              <Link
                key={level}
                href={publicProgramsHref(locale, { country: "china", level })}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-700"
              >
                {label}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {universities.map((university) => (
              <li
                key={university.id}
                className="flex flex-col rounded-3xl border border-stone-200 bg-[#fcfbf9] p-6 sm:p-7"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {university.city[locale]}
                </div>
                <h3 className="font-heading mt-3 text-xl font-semibold text-slate-900">
                  {university.name}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {university.popularMajors[locale].map((major) => (
                    <span
                      key={major}
                      className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-slate-600"
                    >
                      {major}
                    </span>
                  ))}
                </div>
                <p className="mt-5 mb-5 text-sm leading-7 text-slate-600">
                  {university.scholarshipInfo[locale]}
                </p>
                <div className="mt-auto border-t border-stone-200 pt-4 text-sm font-semibold text-slate-800">
                  {university.tuitionEst[locale]}
                </div>
                <Link
                  href={publicProgramsHref(locale, {
                    country: "china",
                    university: university.name.replace(/\s*\([^)]*\)$/, ""),
                  })}
                  className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  {bn
                    ? "তালিকাভুক্ত প্রোগ্রাম দেখুন"
                    : "Explore listed programs"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                  <span className="sr-only">: {university.name}</span>
                </Link>
                <a
                  href={chinaAdmissionsUrl(university.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700"
                >
                  {bn
                    ? "অফিসিয়াল ভর্তি তথ্য"
                    : "Official admissions information"}
                  <MoveUpRight className="size-3.5" />
                  <span className="sr-only">
                    : {university.name}
                    {bn ? " (নতুন ট্যাব)" : " (opens in a new tab)"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </PageShell>
      </section>
      <section
        id="china-planning"
        className="scroll-mt-24 border-y border-stone-200 bg-[#f8f9fa] py-16 sm:py-20"
      >
        <PageShell>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {bn
              ? "আবেদনের আগে পরিকল্পনা করুন"
              : "Plan the details before you apply"}
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {[
              {
                icon: Wallet,
                title: bn ? "সম্পূর্ণ বাজেট দেখুন" : "Build the full budget",
                body: bn
                  ? "টিউশনের সঙ্গে আবাসন, খাবার, বীমা, আবেদন ফি, যাতায়াত ও রেসিডেন্স পারমিটের খরচ ধরুন। লিখিত স্কলারশিপ পাওয়ার আগে ফি মওকুফ ধরে বাজেট করবেন না।"
                  : "Include housing, food, insurance, application fees, travel and residence permit costs alongside tuition. Budget for the full fee until you receive a written scholarship award.",
                href: costCalculatorHref(locale, { destination: "china" }),
                cta: bn ? "খরচ হিসাব করুন" : "Estimate your costs",
              },
              {
                icon: GraduationCap,
                title: bn
                  ? "স্কলারশিপের পথ মিলিয়ে নিন"
                  : "Match the scholarship route",
                body: bn
                  ? "সিএসসি, প্রাদেশিক ও বিশ্ববিদ্যালয়ের বৃত্তির শর্ত আলাদা। ZJU-এর স্নাতক CSC Type A চীনা মাধ্যমের জন্য; ইংরেজি মাধ্যমের কোর্সে একই সুবিধা ধরে নেওয়া যাবে না।"
                  : "CSC, provincial and university awards have different rules. ZJU’s undergraduate CSC Type A route is for Chinese-taught programs; the same funding cannot be assumed for an English-taught degree.",
                href: "https://iczu.zju.edu.cn/admissionsen/95568/list.htm",
                cta: bn
                  ? "ZJU স্কলারশিপের শর্ত"
                  : "Read ZJU scholarship options",
              },
              {
                icon: BookOpen,
                title: bn
                  ? "আবেদনের ফাইল তৈরি করুন"
                  : "Prepare your application",
                body: bn
                  ? "পাসপোর্ট, সনদ, নম্বরপত্র ও ভাষার প্রমাণ প্রস্তুত রাখুন। স্নাতকে CSCA ও বিষয়ভিত্তিক শর্ত দেখুন; উচ্চশিক্ষায় স্টাডি প্ল্যান, সুপারিশপত্র বা গবেষণা প্রস্তাব লাগতে পারে।"
                  : "Prepare your passport, certificates, transcripts and language evidence. Check CSCA and subject requirements for undergraduate study; postgraduate applications may need a study plan, references or a research proposal.",
                href: localizedHref("/consultation", locale),
                cta: bn ? "ফাইল মূল্যায়ন করুন" : "Review your profile",
              },
            ].map(({ icon: Icon, title, body, href, cta }) => (
              <div
                key={title}
                className="flex flex-col rounded-3xl border border-stone-200 bg-white p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading mt-5 text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  {body}
                </p>
                <a
                  href={href}
                  className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-orange-700"
                >
                  {cta}
                  <ArrowRight className="size-4" />
                </a>
              </div>
            ))}
          </div>
        </PageShell>
      </section>
      <section
        id="china-questions"
        className="scroll-mt-24 bg-white py-16 sm:py-20"
      >
        <PageShell className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-red-700 uppercase">
              {bn ? "সাধারণ প্রশ্ন" : "A little more clarity"}
            </p>
            <h2 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {bn
                ? "চীনে পড়াশোনা নিয়ে আপনার প্রশ্ন"
                : "Your questions about studying in China"}
            </h2>
          </div>
          <div className="space-y-3">
            {questions.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-2xl border border-stone-200 bg-[#fcfbf9] p-5"
              >
                <summary className="focus-ring cursor-pointer text-sm leading-6 font-semibold text-slate-900">
                  {question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {answer}
                </p>
              </details>
            ))}
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-3 text-xs text-slate-500">
              <a
                href="https://www.bmdc.org.bd/"
                className="focus-ring underline underline-offset-4"
              >
                {bn ? "BMDC-এর বর্তমান নির্দেশনা" : "Current BMDC guidance"}
              </a>
              <a
                href="https://search.wdoms.org/"
                className="focus-ring underline underline-offset-4"
              >
                {bn
                  ? "মেডিকেল ডিরেক্টরির শর্ত"
                  : "Medical directory disclaimer"}
              </a>
              <a
                href="https://bd.china-embassy.gov.cn/eng/sghd/202509/t20250912_11707745.htm"
                className="focus-ring underline underline-offset-4"
              >
                {bn
                  ? "চীনা দূতাবাসের ভিসা নির্দেশনা"
                  : "Chinese Embassy visa guidance"}
              </a>
            </div>
          </div>
        </PageShell>
      </section>
    </>
  );
}
