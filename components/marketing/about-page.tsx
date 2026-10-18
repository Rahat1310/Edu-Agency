"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  BookOpen,
  Calendar,
  Compass,
  FileText,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";
import * as motion from "framer-motion/client";
import { PageShell } from "@/components/layout/page-shell";
import {
  CounsellingProcessIllustration,
  EducationJourneyIllustration,
} from "@/components/marketing/about-illustrations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { getWhatsAppHref } from "@/lib/whatsapp";
const STUDY_DESTINATIONS = [
  {
    id: "china",
    flag: "🇨🇳",
    nameEn: "China",
    nameBn: "চীন",
    badgeEn: "China-focused guidance",
    badgeBn: "চীনে পড়াশোনার পরামর্শ",
    isCore: true,
    titleEn: "Our Longest-Standing Area of Experience",
    titleBn: "আমাদের দীর্ঘতম বাস্তব অভিজ্ঞতা",
    descEn:
      "Support with university applications, government and university scholarship options, JW201/JW202 documentation, and student visa preparation.",
    descBn:
      "বিশ্ববিদ্যালয়ে ভর্তি আবেদন, সরকারি ও বিশ্ববিদ্যালয় স্কলারশিপের সুযোগ, JW201/JW202 কাগজপত্র ও স্টুডেন্ট ভিসার প্রস্তুতিতে সহায়তা।",
  },
  {
    id: "india",
    flag: "🇮🇳",
    nameEn: "India",
    nameBn: "ভারত",
    badgeEn: "Admission & Scholarships",
    badgeBn: "ভর্তি ও স্কলারশিপ সহায়তা",
    isCore: false,
    titleEn: "Admission Applications & Scholarship Guidance",
    titleBn: "ভর্তি আবেদন ও স্কলারশিপ সহায়তা",
    descEn:
      "Support with university and course selection, admission applications, available tuition fee waivers, and student visa preparation. Discuss the service scope and applicable costs with our team.",
    descBn:
      "বিশ্ববিদ্যালয় ও কোর্স নির্বাচন, ভর্তি আবেদন, উপলব্ধ টিউশন ফি ছাড় এবং স্টুডেন্ট ভিসা প্রস্তুতিতে সহায়তা। সেবার পরিধি ও প্রযোজ্য খরচ আমাদের টিমের সাথে আলোচনা করুন।",
  },
  {
    id: "malaysia",
    flag: "🇲🇾",
    nameEn: "Malaysia",
    nameBn: "মালয়েশিয়া",
    badgeEn: "EMGS & Dual Degrees",
    badgeBn: "EMGS ও ডুয়াল ডিগ্রি",
    isCore: false,
    titleEn: "University Admission & Student Pass Support",
    titleBn: "বিশ্ববিদ্যালয়ে ভর্তি ও স্টুডেন্ট পাসের সহায়তা",
    descEn:
      "Guidance on university options, entry requirements, tuition costs, admission applications, and student pass documentation.",
    descBn:
      "বিশ্ববিদ্যালয়ের বিকল্প, ভর্তির যোগ্যতা, টিউশন খরচ, ভর্তি আবেদন ও স্টুডেন্ট পাসের কাগজপত্র সম্পর্কে পরামর্শ।",
  },
  {
    id: "south-korea",
    flag: "🇰🇷",
    nameEn: "South Korea",
    nameBn: "দক্ষিণ কোরিয়া",
    badgeEn: "D-2 / D-4 Visa Pathways",
    badgeBn: "D-2 / D-4 ভিসা পাথওয়ে",
    isCore: false,
    titleEn: "Degree programmes & scholarship guidance",
    titleBn: "ডিগ্রি প্রোগ্রাম ও স্কলারশিপের পরামর্শ",
    descEn:
      "Guidance on suitable undergraduate & graduate degrees, scholarship applications, language criteria, and student visa preparation.",
    descBn:
      "উপযুক্ত একাডেমিক প্রোগ্রাম, সরকারি ও প্রাতিষ্ঠানিক স্কলারশিপ, কোরিয়ান ল্যাঙ্গুয়েজ ট্রেনিং (TOPIK/IELTS) এবং সুনির্দিষ্ট ভিসা প্রস্তুতি।",
  },
  {
    id: "japan",
    flag: "🇯🇵",
    nameEn: "Japan",
    nameBn: "জাপান",
    badgeEn: "COE & Academic Pathways",
    badgeBn: "COE ও একাডেমি পাথওয়ে",
    isCore: false,
    titleEn: "Study options & application guidance",
    titleBn: "পড়াশোনার বিকল্প ও আবেদনের পরামর্শ",
    descEn:
      "Guidance for Bangladeshi students exploring suitable academic opportunities in Japan, clarifying language expectations, entry requirements, and application procedures.",
    descBn:
      "জাপানের বিশিষ্ট শিক্ষা প্রতিষ্ঠানগুলোতে উপযুক্ত কোর্স নির্বাচন, ভর্তি আবেদনের যোগ্যতা, COE সংক্রান্ত প্রস্তুতি এবং প্রয়োজনীয় দিকনির্দেশনা।",
  },
];
interface AboutPageProps {
  locale?: Locale;
  dict?: Dictionary;
  hasPublishedStories?: boolean;
}
export function AboutPage({
  locale = "en",
  hasPublishedStories = false,
}: AboutPageProps) {
  const isBn = locale === "bn";
  const whatsappConsultationHref = getWhatsAppHref(
    isBn
      ? "হ্যালো, আমি বিদেশে উচ্চশিক্ষা নিয়ে স্টাডি অ্যাব্রড কনসালটেন্সির সাথে কথা বলতে চাই।"
      : "Hello, I would like to consult with Study Abroad Consultant regarding my international study options.",
  );
  return (
    <div className="flex flex-col">
      <section
        aria-labelledby="agency-introduction"
        className="border-b border-stone-200 bg-[#fbfaf7] py-10 sm:py-14"
      >
        <PageShell>
          <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12">
            <div>
              <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-[var(--brand-blue)] uppercase">
                {isBn ? "আমাদের পরিচয়" : "Get to know us"}
              </p>
              <div className="mt-4 flex items-center gap-4 sm:gap-6">
                <h1
                  id="agency-introduction"
                  className="agency-wordmark text-[var(--brand-navy)]"
                >
                  <span className="block text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-[-0.045em]">
                    <span className="font-serif font-medium italic">Study</span>{" "}
                    <span className="font-display font-semibold text-[var(--brand-blue)]">
                      Abroad
                    </span>
                  </span>
                  <span className="mt-4 flex items-center gap-3 text-[clamp(0.75rem,1.2vw,0.95rem)] font-semibold tracking-[0.28em] uppercase">
                    <span
                      aria-hidden="true"
                      className="h-px w-6 bg-[var(--brand-blue)] sm:w-9"
                    />
                    Consultant
                  </span>
                </h1>
              </div>
              <p className="mt-5 text-xs font-medium tracking-wide text-slate-500">
                {isBn
                  ? "নিকুঞ্জা, ঢাকা, বাংলাদেশ"
                  : "Nikunja, Dhaka, Bangladesh"}
              </p>
            </div>
            <div className="border-l-2 border-[var(--brand-blue)] py-2 pl-6 sm:pl-8">
              <p className="mb-3 text-[0.65rem] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                {isBn ? "আমাদের মূলমন্ত্র" : "Our motto"}
              </p>
              <p className="font-serif text-[clamp(1.5rem,2.7vw,2.3rem)] leading-[1.45] tracking-tight text-[var(--brand-navy)] italic">
                Study Beyond Borders.
                <br />
                <span className="text-[var(--brand-blue)]">
                  Dream Beyond Limits.
                </span>
              </p>
            </div>
          </div>
        </PageShell>
      </section>
      {/* =========================================================================
            SECTION 1 — HERO: The Company Behind the Guidance
            ========================================================================= */}
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f5f2] pt-12 pb-16 sm:pt-20 sm:pb-24">
        <PageShell className="relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Left Content (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.14em] text-[var(--brand-blue)] uppercase">
                <span>{isBn ? "আমাদের সম্পর্কে" : "About our agency"}</span>
              </div>

              {/* Main Heading */}
              <h2 className="font-heading mt-4 text-3xl leading-[1.12] font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
                {isBn
                  ? "বাংলাদেশি শিক্ষার্থীদের বিদেশে পড়াশোনার পরিকল্পনায় সহায়তা।"
                  : "Helping Bangladeshi students plan their studies abroad."}
              </h2>

              {/* 12+ Years Experience Highlight Badge */}
              <div className="mt-5 inline-flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50/90 px-4 py-2 text-xs font-bold text-amber-950 shadow-2xs">
                <Award className="size-4 text-amber-600" />
                <span>
                  {isBn
                    ? "আমাদের টিমের চীন উচ্চশিক্ষায় ১২+ বছরের অভিজ্ঞতা"
                    : "Our team brings 12+ years of China-focused experience"}
                </span>
              </div>

              {/* Supporting Copy */}
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed">
                {isBn
                  ? "Study Abroad Consultant ঢাকার নিকুঞ্জে অবস্থিত একটি শিক্ষা পরামর্শ প্রতিষ্ঠান। আমরা শিক্ষার্থীদের বিশ্ববিদ্যালয় ও কোর্স তুলনা করতে, খরচ বুঝতে, স্কলারশিপের সুযোগ খুঁজতে এবং ভর্তি ও স্টুডেন্ট ভিসার আবেদন প্রস্তুত করতে সাহায্য করি। আপনার শিক্ষাগত যোগ্যতা, আগ্রহ ও বাজেট বুঝেই আমাদের কাউন্সেলিং শুরু হয়।"
                  : "Study Abroad Consultant is an education consultancy based in Nikunja, Dhaka. We help students compare universities and courses, understand costs, explore scholarships, and prepare admission and student visa applications. Our counselling starts with your academic background, interests, and budget."}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={localizedHref("/eligibility-quiz", locale)}
                  className="btn-sunset focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold text-white shadow-md"
                >
                  {isBn ? "ফ্রি প্রোফাইল মূল্যায়ন" : "Free Profile Assessment"}
                </Link>
                <a
                  href={whatsappConsultationHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-slate-800 shadow-xs hover:bg-white"
                >
                  <MessageCircle
                    className="size-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  {isBn
                    ? "হোয়াটসঅ্যাপে কাউন্সেলরের সঙ্গে কথা বলুন"
                    : "WhatsApp Our Counsellor"}
                </a>
              </div>
            </motion.div>

            {/* Right Illustration (5 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="lg:col-span-5"
            >
              <EducationJourneyIllustration showExperienceBadge={false} />
            </motion.div>
          </div>
        </PageShell>
      </section>

      <section
        aria-label={isBn ? "এই পৃষ্ঠার বিভাগসমূহ" : "About page sections"}
        className="relative overflow-hidden border-b border-orange-200/60 bg-gradient-to-b from-[#faf5ee] via-[#fff4ea]/90 to-[#fdf8f3] py-4 sm:py-5"
      >
        {/* Premium Agency Sunset Mesh Ambient Lighting (Warm Sunset, Amber, Gold) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-1/4 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-orange-300/35 via-amber-200/30 to-rose-200/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 right-1/4 h-64 w-[30rem] rounded-full bg-gradient-to-bl from-amber-200/35 via-orange-200/25 to-yellow-100/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 left-1/2 h-44 w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-t from-orange-100/30 to-transparent blur-2xl"
        />

        <PageShell className="relative z-10">
          <dl
            aria-label={isBn ? "এক নজরে প্রতিষ্ঠান" : "Company at a glance"}
            className="grid grid-cols-1 gap-3.5 py-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                icon: Calendar,
                label: isBn ? "নতুন ব্র্যান্ড পরিচয়" : "Rebranded",
                value: isBn ? "ফেব্রুয়ারি ২০২৬" : "February 2026",
              },
              {
                icon: MapPin,
                label: isBn ? "অবস্থান" : "Based in",
                value: isBn ? "নিকুঞ্জা-২, ঢাকা" : "Nikunja-2, Dhaka",
              },
              {
                icon: Users,
                label: isBn ? "যাদের জন্য কাজ করি" : "Who we support",
                value: isBn
                  ? "বাংলাদেশি শিক্ষার্থী ও পরিবার"
                  : "Bangladeshi students & families",
              },
              {
                icon: Globe2,
                label: isBn ? "পড়াশোনার গন্তব্য" : "Study destinations",
                value: isBn
                  ? "চীন, ভারত, মালয়েশিয়া, দক্ষিণ কোরিয়া ও জাপান"
                  : "China, India, Malaysia, South Korea & Japan",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex min-w-0 items-start gap-3.5 rounded-2xl border border-white/95 bg-white/70 p-4 shadow-[0_8px_30px_rgba(234,88,12,0.04),inset_0_1px_1px_rgba(255,255,255,1)] ring-1 ring-orange-950/[0.03] backdrop-blur-xl"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-orange-100/80 bg-gradient-to-br from-white/95 to-orange-50/50 text-orange-700 shadow-xs">
                  <item.icon className="size-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <dt className="text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 font-bold text-slate-800">
                    {item.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {/* Frosted Translucent Sub-navigation Pills */}
          <nav
            aria-label={isBn ? "এই পৃষ্ঠার বিভাগসমূহ" : "On this page"}
            className="no-scrollbar flex items-center gap-2 overflow-x-auto scroll-smooth border-t border-orange-200/50 py-3.5"
          >
            <div className="flex shrink-0 items-center gap-1.5 pr-2.5 text-[0.68rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
              <span className="size-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
              <span>{isBn ? "বিভাগে যান" : "Jump to"}</span>
            </div>
            {[
              ["story", isBn ? "আমাদের গল্প" : "Our story"],
              ["purpose", isBn ? "লক্ষ্য ও দিকনির্দেশনা" : "Mission & vision"],
              ["commitments", isBn ? "আমাদের অঙ্গীকার" : "Our commitments"],
              ["destinations", isBn ? "গন্তব্যসমূহ" : "Destinations"],
              ["services", isBn ? "সেবাসমূহ" : "Services"],
              ["ceo-message", isBn ? "সিইওর বার্তা" : "CEO’s message"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="focus-ring shrink-0 rounded-full border border-white/95 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_rgba(234,88,12,0.03),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md transition-all duration-200 hover:border-orange-300 hover:bg-white hover:text-orange-600 hover:shadow-xs active:scale-95"
              >
                {label}
              </a>
            ))}
          </nav>
        </PageShell>
      </section>

      {/* =========================================================================
            SECTION 2 — OUR STORY (Centerpiece): Built on Experience, Growing Beyond Borders
            ========================================================================= */}
      <section
        id="story"
        className="relative scroll-mt-28 border-b border-stone-200/80 bg-white py-16 sm:py-24"
      >
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xs font-bold tracking-wide text-orange-700">
              {isBn ? "আমাদের গল্প" : "Our story"}
            </h2>
            <p className="font-heading mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "চীন দিয়ে শুরু। এখন আরও গন্তব্যে পড়াশোনার সহায়তা।"
                : "Starting with China. Growing to support more study destinations."}
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl space-y-4 rounded-3xl border border-stone-200/90 bg-stone-50/60 p-6 text-base leading-7 text-slate-700 sm:p-10">
            <p>
              {isBn
                ? "আমাদের টিমের অভিজ্ঞতার শুরু ঢাকার আগের একটি শিক্ষা পরামর্শ প্রতিষ্ঠানের মাধ্যমে বাংলাদেশি শিক্ষার্থীদের চীনের বিশ্ববিদ্যালয়ে আবেদন করতে সহায়তা করার মধ্য দিয়ে। সেই কাজের মধ্যে ছিল ভর্তি আবেদন, স্কলারশিপের পরামর্শ এবং শিক্ষার্থীদের প্রয়োজনীয় কাগজপত্র প্রস্তুতিতে সহায়তা।"
                : "Our team’s experience began with helping Bangladeshi students apply to universities in China through an earlier education consultancy in Dhaka. That work included admission applications, scholarship guidance, and student documentation."}
            </p>
            <p>
              {isBn
                ? "আরও বেশি গন্তব্যে সেবা সম্প্রসারণের সঙ্গে সঙ্গে ফেব্রুয়ারি ২০২৬-এ আমরা Study Abroad Consultant নামটি চালু করি।"
                : "In February 2026, we introduced the name Study Abroad Consultant as we expanded our services to more destinations."}
            </p>
            <p>
              {isBn
                ? "বর্তমানে আমরা চীন, ভারত, মালয়েশিয়া, দক্ষিণ কোরিয়া ও জাপানে পড়তে আগ্রহী শিক্ষার্থীদের সহায়তা করি। উপযুক্ত বিকল্প তুলনা করা, খরচ বোঝা এবং আবেদনের প্রতিটি ধাপের প্রস্তুতিতে আমরা পাশে থাকি।"
                : "Today, we support students considering China, India, Malaysia, South Korea, and Japan. We help them compare suitable options, understand the costs, and prepare for each stage of the application."}
            </p>
          </div>
        </PageShell>
      </section>

      <section
        id="purpose"
        className="scroll-mt-28 border-b border-stone-200 bg-white py-12 sm:py-16"
      >
        <PageShell>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="marketing-glass-card rounded-2xl p-7 sm:p-9">
              <Compass
                className="size-6 text-[var(--brand-blue)]"
                aria-hidden="true"
              />
              <h2 className="font-display mt-5 text-2xl font-semibold text-[var(--brand-navy)]">
                {isBn ? "আমাদের মিশন" : "Our mission"}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {isBn
                  ? "ব্যক্তিগত কাউন্সেলিং, খরচ ও যোগ্যতার শর্ত সম্পর্কে স্পষ্ট তথ্য এবং আবেদন প্রস্তুতিতে ব্যবহারিক সহায়তার মাধ্যমে বাংলাদেশি শিক্ষার্থীদের ভেবেচিন্তে পড়াশোনার সিদ্ধান্ত নিতে সাহায্য করা।"
                  : "To help Bangladeshi students make informed study choices through individual counselling, clear information about costs and requirements, and practical application support."}
              </p>
            </article>
            <article className="marketing-glass-card rounded-2xl p-7 sm:p-9">
              <Globe2
                className="size-6 text-[var(--brand-blue)]"
                aria-hidden="true"
              />
              <h2 className="font-display mt-5 text-2xl font-semibold text-[var(--brand-navy)]">
                {isBn ? "আমাদের ভিশন" : "Our vision"}
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {isBn
                  ? "সৎ পরামর্শ, যত্নসহকারে আবেদন প্রস্তুতিতে সহায়তা এবং পড়াশোনার বিকল্পগুলো স্পষ্টভাবে বুঝিয়ে দেওয়ার জন্য শিক্ষার্থী ও পরিবার অন্যদের কাছে সুপারিশ করবেন—এমন একটি পরামর্শ প্রতিষ্ঠান হয়ে ওঠা।"
                  : "To become a consultancy that students and families recommend for honest advice, careful application support, and a clear understanding of their study options."}
              </p>
            </article>
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
            SECTION 3 — OUR APPROACH: We Start With the Student, Not the University
            ========================================================================= */}
      <section
        id="commitments"
        className="relative scroll-mt-28 border-b border-stone-200/80 bg-stone-50/60 py-16 sm:py-24"
      >
        <PageShell>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Left Content (6.5 cols) */}
            <div className="flex flex-col lg:col-span-7">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
                <span>
                  {isBn
                    ? "শিক্ষার্থীদের প্রতি আমাদের অঙ্গীকার"
                    : "OUR COMMITMENTS"}
                </span>
              </div>

              <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {isBn
                  ? "আপনার লক্ষ্যকে কেন্দ্র করেই আমাদের পরামর্শ।"
                  : "Your goals shape our guidance."}
              </h2>

              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                {isBn
                  ? "আপনার শিক্ষাগত যোগ্যতা, পছন্দের বিষয়, ভাষার দক্ষতা, পারিবারিক বাজেট এবং ভবিষ্যৎ পরিকল্পনা বুঝে আমরা উপযুক্ত বিকল্প নিয়ে আলোচনা করি।"
                  : "Every student has unique financial realities and academic ambitions. Good counselling begins by understanding your individual situation before recommending a destination."}
              </p>

              {/* 3 Core Principles */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-700">
                    01
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      {isBn ? "আপনার পরিকল্পনা বোঝা" : "Understand your plans"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {isBn
                        ? "পড়াশোনার বিকল্প প্রস্তাব করার আগে আপনার শিক্ষাগত যোগ্যতা, বিষয়ের আগ্রহ, বাজেট ও ভবিষ্যৎ পরিকল্পনা নিয়ে আলোচনা করি।"
                        : "We discuss your academic background, subject interests, budget, and future plans before suggesting study options."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-700">
                    02
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      {isBn ? "বিকল্পগুলো বুঝিয়ে বলা" : "Explain your options"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {isBn
                        ? "উপযুক্ত কোর্স, ভর্তির যোগ্যতা, আনুমানিক খরচ এবং উপলব্ধ স্কলারশিপ তুলনা করতে সাহায্য করি।"
                        : "We help you compare suitable courses, entry requirements, estimated costs, and available scholarships."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
                    03
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      {isBn
                        ? "পরবর্তী ধাপের প্রস্তুতি"
                        : "Prepare the next steps"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {isBn
                        ? "কোন কাগজপত্র কখন প্রস্তুত করতে হবে তা বোঝাতে প্রয়োজনীয় নথি, সময়সীমা ও আবেদনের ধাপগুলো বুঝিয়ে দিই।"
                        : "We explain the documents, deadlines, and application steps so you know what to prepare and when."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Thoughtful Diagram / Illustration (5.5 cols) */}
            <div className="lg:col-span-5">
              <CounsellingProcessIllustration />
            </div>
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
            SECTION 4 — STUDY DESTINATIONS: Where we can help you study
            ========================================================================= */}
      <section
        id="destinations"
        className="relative scroll-mt-28 border-b border-stone-200/80 bg-white py-16 sm:py-24"
      >
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
              <span>{isBn ? "অধ্যয়ন গন্তব্যসমূহ" : "STUDY DESTINATIONS"}</span>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "আন্তর্জাতিক উচ্চশিক্ষার দ্বার উন্মোচন"
                : "Where we can help you study"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "আমাদের কাউন্সেলিং সেবার আওতায় থাকা গন্তব্যগুলো জানুন। প্রতিষ্ঠান ও সেশন অনুযায়ী প্রোগ্রামের সুযোগ এবং আবেদনের শর্ত ভিন্ন হয়।"
                : "Explore the destinations covered by our counselling services. Programme availability and application requirements vary by institution and intake."}
            </p>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6">
            {STUDY_DESTINATIONS.map((dest) => {
              const name = isBn ? dest.nameBn : dest.nameEn;
              const badge = isBn ? dest.badgeBn : dest.badgeEn;
              const title = isBn ? dest.titleBn : dest.titleEn;
              const desc = isBn ? dest.descBn : dest.descEn;
              return (
                <div
                  key={dest.id}
                  className="marketing-glass-card group relative flex w-full flex-col justify-between rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-950/5 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-2xl leading-none select-none"
                          role="img"
                          aria-label={name}
                        >
                          {dest.flag}
                        </span>
                        <span className="font-heading text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-orange-950">
                          {name}
                        </span>
                      </div>

                      {dest.isCore ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-orange-50/90 px-3 py-1 text-[0.7rem] font-semibold text-orange-900 shadow-2xs">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                          {badge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 bg-white/90 px-3 py-1 text-[0.7rem] font-medium text-slate-700 shadow-2xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80" />
                          {badge}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-900">
                      {title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
            SECTION 5 — WHAT WE HELP WITH: Support with your study plans
            ========================================================================= */}
      <section
        id="services"
        className="relative scroll-mt-28 border-b border-stone-200/80 bg-stone-50/60 py-16 sm:py-24"
      >
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
              <span>{isBn ? "আমাদের সেবাসমূহ" : "OUR SERVICES"}</span>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "শুধু বিশ্ববিদ্যালয় নির্বাচন নয়, সার্বিক সহায়তা"
                : "Support with your study plans"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "প্রথম কাউন্সেলিং থেকে যাত্রার প্রস্তুতি পর্যন্ত আপনার আবেদনের প্রতিটি ধাপে নির্দিষ্ট সহায়তা।"
                : "From the first consultation to preparing for departure, each service has a practical purpose in your application journey."}
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <Compass className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn ? "প্রোফাইল মূল্যায়ন" : "Profile Assessment"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "উপযুক্ত বিকল্প খুঁজতে আপনার শিক্ষাগত যোগ্যতা, ভাষার দক্ষতা, পড়াশোনার ইতিহাস ও বাজেট পর্যালোচনা করি।"
                  : "We review your academic background, language qualifications, study history, and budget to identify suitable options."}
              </p>
            </div>
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <BookOpen className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn
                  ? "বিশ্ববিদ্যালয় ও কোর্স নির্বাচন"
                  : "University & Course Selection"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "ভর্তির যোগ্যতা, আগ্রহ, ক্যারিয়ার পরিকল্পনা ও আনুমানিক খরচ বিবেচনা করে বিশ্ববিদ্যালয় ও কোর্স তুলনা করতে সাহায্য করি।"
                  : "We help you compare universities and courses based on entry requirements, interests, career plans, and estimated costs."}
              </p>
            </div>
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <Award className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn ? "স্কলারশিপের পরামর্শ" : "Scholarship Guidance"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "উপলব্ধ স্কলারশিপ, যোগ্যতার শর্ত ও আবেদনের ধাপ বুঝিয়ে দিই। স্কলারশিপ পাওয়া নির্ভর করে প্রদানকারী প্রতিষ্ঠানের শর্ত ও নির্বাচন প্রক্রিয়ার ওপর।"
                  : "We explain available scholarships, eligibility requirements, and application steps. Awards depend on the provider’s criteria and selection process."}
              </p>
            </div>
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <FileText className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn
                  ? "ভর্তি আবেদনে সহায়তা"
                  : "Admission Application Support"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "আবেদনপত্র ও প্রয়োজনীয় কাগজপত্র প্রস্তুত করতে, শর্তগুলো যাচাই করতে এবং সময়সীমা মনে রাখতে সাহায্য করি।"
                  : "We help you prepare application forms and supporting documents, check requirements, and keep track of deadlines."}
              </p>
            </div>
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <Globe2 className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn
                  ? "স্টুডেন্ট ভিসার প্রস্তুতি"
                  : "Student Visa Preparation"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "স্টুডেন্ট ভিসার আবেদনের জন্য প্রয়োজনীয় কাগজপত্র, ফরম ও অন্যান্য প্রস্তুতি সম্পর্কে দিকনির্দেশনা দিই।"
                  : "We guide you through the relevant document requirements, forms, and preparation for your student visa application."}
              </p>
            </div>
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <MapPin className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn
                  ? "আবাসন ও যাত্রার প্রস্তুতি"
                  : "Accommodation & Pre-Departure Guidance"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "আবাসনের বিকল্প বুঝতে এবং ভ্রমণ, বিশ্ববিদ্যালয়ে নিবন্ধন ও পৌঁছানোর পরের প্রস্তুতিতে সাহায্য করি।"
                  : "We help you understand accommodation options and prepare for travel, university registration, and arrival."}
              </p>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-sm leading-6 text-slate-600">
            {isBn
              ? "ভর্তি, স্কলারশিপ ও ভিসার সিদ্ধান্ত সংশ্লিষ্ট বিশ্ববিদ্যালয় ও কর্তৃপক্ষ নেয়। আমাদের কাজ হলো শর্তগুলো বুঝতে এবং আবেদন প্রস্তুত করতে আপনাকে সাহায্য করা।"
              : "Admission, scholarship, and visa decisions are made by the relevant universities and authorities. Our role is to help you understand the requirements and prepare your application."}
          </p>
          {hasPublishedStories ? (
            <div className="mt-6 text-center">
              <Link
                href={localizedHref("/success-stories", locale)}
                className="focus-ring inline-flex min-h-11 items-center rounded-full border border-orange-200 bg-white px-5 text-sm font-semibold text-orange-700 hover:bg-orange-50"
              >
                {isBn
                  ? "শিক্ষার্থীদের অভিজ্ঞতা পড়ুন"
                  : "Read our students’ stories"}
              </Link>
            </div>
          ) : null}
        </PageShell>
      </section>

      <section
        id="ceo-message"
        aria-labelledby="ceo-message-heading"
        className="scroll-mt-28 border-b border-stone-200 bg-[#fbfaf7] py-16 sm:py-24"
      >
        <PageShell>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)] lg:gap-16">
            <aside>
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[var(--brand-blue)] uppercase">
                {isBn ? "নেতৃত্বের বার্তা" : "A message from our CEO"}
              </p>
              <div className="mt-6 aspect-[3/4] max-w-sm overflow-hidden rounded-2xl border border-slate-300/60">
                <Image
                  src="/images/ceo-rakib-hasan.jpg"
                  alt="Engr. MD Rakib Hasan – CEO & Co-founder"
                  width={796}
                  height={1024}
                  sizes="(min-width: 1024px) 30vw, 384px"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <p className="font-display mt-5 text-lg font-semibold text-[var(--brand-navy)]">
                Engr. MD Rakib Hasan
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {isBn
                  ? "প্রধান নির্বাহী কর্মকর্তা ও সহ-প্রতিষ্ঠাতা"
                  : "CEO & Co-founder"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Study Abroad Consultant
              </p>
            </aside>
            <article>
              <h2
                id="ceo-message-heading"
                className="font-serif text-3xl leading-[1.25] tracking-tight text-[var(--brand-navy)] sm:text-4xl"
              >
                {isBn
                  ? "ভালো পরামর্শের শুরু মন দিয়ে শোনা থেকে।"
                  : "Good advice starts with listening."}
              </h2>
              <div className="mt-7 max-w-2xl space-y-5 text-base leading-8 text-slate-600">
                <p>
                  {isBn
                    ? "বিদেশে পড়াশোনা একজন শিক্ষার্থী ও তার পরিবারের জন্য বড় সিদ্ধান্ত। বিশ্ববিদ্যালয়ের পরামর্শ দেওয়ার আগে আমাদের বুঝতে হবে আপনি কী পড়তে চান, পড়াশোনার পরে কী করতে চান এবং আপনার পরিবার কতটা খরচ বহন করতে পারবে।"
                    : "Studying abroad is a big decision for a student and their family. Before recommending a university, we need to understand what you want to study, what you hope to do afterwards, and what your family can afford."}
                </p>
                <p>
                  {isBn
                    ? "Study Abroad Consultant-এ আমাদের দায়িত্ব হলো আপনার বিকল্পগুলো স্পষ্টভাবে বুঝিয়ে দেওয়া এবং যত্নসহকারে আবেদন প্রস্তুত করতে সাহায্য করা। সিদ্ধান্ত নেওয়ার আগে সম্ভাব্য খরচ, ভর্তির যোগ্যতা এবং পরবর্তী ধাপগুলো আপনার জানা থাকা উচিত।"
                    : "At Study Abroad Consultant, our responsibility is to explain your options clearly and help you prepare your application carefully. You should understand the likely costs, entry requirements, and next steps before making a commitment."}
                </p>
                <p>
                  {isBn
                    ? "আপনার পরিকল্পনা নিয়ে আমাদের টিমের সঙ্গে কথা বলার আমন্ত্রণ রইল। আমরা সময় নিয়ে আপনার পরিস্থিতি বুঝব এবং কীভাবে এগোবেন তা ঠিক করতে সাহায্য করব।"
                    : "I invite you to speak with our team about your plans. We will take the time to understand your situation and help you decide how to move forward."}
                </p>
              </div>
              <div className="mt-8 border-t border-stone-300/70 pt-5">
                <p className="font-serif text-xl text-[var(--brand-blue)] italic">
                  Engr. MD Rakib Hasan
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {isBn
                    ? "প্রধান নির্বাহী কর্মকর্তা ও সহ-প্রতিষ্ঠাতা · Study Abroad Consultant"
                    : "CEO & Co-founder · Study Abroad Consultant"}
                </p>
              </div>
            </article>
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
            SECTION 9 — FINAL CTA & OFFICE INFORMATION
            ========================================================================= */}
      <section className="relative overflow-hidden bg-[var(--brand-navy)] py-16 text-white sm:py-24">
        <PageShell className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left CTA (7 cols) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>{isBn ? "পরামর্শ শুরু করুন" : "LET'S TALK"}</span>
              </div>

              <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {isBn
                  ? "আসুন কথা বলি আপনার উচ্চশিক্ষার পরিকল্পনা নিয়ে।"
                  : "Let's Talk About Your Study Abroad Plans."}
              </h2>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {isBn
                  ? "আপনার পছন্দের গন্তব্য নির্দিষ্ট থাকুক বা একাধিক দেশ তুলনা করতে চান—আপনার শিক্ষাগত যোগ্যতা, কাঙ্ক্ষিত ডিগ্রি ও পারিবারিক বাজেট শেয়ার করুন। আমাদের টিম আপনাকে সবচেয়ে উপযোগী সুযোগগুলো বুঝতে সাহায্য করবে।"
                  : "Whether you already have a destination in mind or are still comparing your options, start by sharing your academic background, preferred degree, and budget. Our team can help you understand the opportunities worth exploring."}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={localizedHref("/eligibility-quiz", locale)}
                  className="btn-sunset focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold shadow-md"
                >
                  {isBn
                    ? "ফ্রি প্রোফাইল মূল্যায়ন পান"
                    : "Get Free Profile Assessment"}
                </Link>

                <a
                  href={whatsappConsultationHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-slate-800 shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
                >
                  <MessageCircle className="size-4 text-emerald-600" />
                  <span>
                    {isBn
                      ? "হোয়াটসঅ্যাপে কাউন্সেলর"
                      : "WhatsApp Our Counsellor"}
                  </span>
                </a>
              </div>
            </div>

            {/* Right Office Info Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl sm:p-8">
                <h3 className="font-heading text-lg font-bold text-white">
                  Study Abroad Consultant
                </h3>
                <p className="mt-1 text-xs text-orange-300 italic">
                  Nikunja-2, Khilkhet, Dhaka
                </p>

                <div className="mt-6 min-w-0 space-y-4 text-xs sm:text-sm">
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-orange-400" />
                    <div>
                      <p className="font-medium text-white">
                        1st Floor, House 16, Road 14
                      </p>
                      <p className="text-slate-300">
                        Nikunja-2, Khilkhet, Dhaka, Bangladesh
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start gap-3">
                    <MessageCircle className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-xs text-slate-400">Phone / WhatsApp</p>
                      <a
                        href="https://wa.me/8801354935958"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-white hover:text-emerald-300"
                      >
                        +880 1354-935958
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-orange-400" />
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <a
                        href="mailto:support@studyabroadconsultantbd.com"
                        className="font-medium break-all text-white hover:text-orange-300"
                      >
                        support@studyabroadconsultantbd.com
                      </a>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-start gap-3">
                    <Globe2 className="mt-0.5 size-4 shrink-0 text-sky-400" />
                    <div>
                      <p className="text-xs text-slate-400">Website</p>
                      <a
                        href="https://www.studyabroadconsultantbd.com"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium break-all text-white hover:text-sky-300"
                      >
                        www.studyabroadconsultantbd.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageShell>
      </section>
    </div>
  );
}
