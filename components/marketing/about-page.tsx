"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Compass,
  FileCheck2,
  FileText,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  PlaneTakeoff,
  ShieldCheck,
  Users,
} from "lucide-react";
import * as motion from "framer-motion/client";

import { PageShell } from "@/components/layout/page-shell";
import {
  CounsellingProcessIllustration,
  EducationJourneyIllustration,
  LeadershipAvatar,
  TimelineJourneyIllustration,
} from "@/components/marketing/about-illustrations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { getWhatsAppHref } from "@/lib/whatsapp";

interface AboutPageProps {
  locale?: Locale;
  dict?: Dictionary;
}

export function AboutPage({ locale = "en" }: AboutPageProps) {
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
                  ? "ঢাকা, বাংলাদেশ · প্রতিষ্ঠিত ফেব্রুয়ারি ২০২৬"
                  : "Dhaka, Bangladesh · Established February 2026"}
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
                  ? "বাংলাদেশি শিক্ষার্থী ও পরিবারের জন্য উচ্চশিক্ষার দিকনির্দেশনা।"
                  : "Education guidance for students and families in Bangladesh."}
              </h2>

              {/* 8+ Years Experience Highlight Badge */}
              <div className="mt-5 inline-flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50/90 px-4 py-2 text-xs font-bold text-amber-950 shadow-2xs">
                <Award className="size-4 text-amber-600" />
                <span>
                  {isBn
                    ? "আমাদের টিমের চীন উচ্চশিক্ষায় ৮+ বছরের অভিজ্ঞতা"
                    : "Our team brings 8+ years of China-focused experience"}
                </span>
              </div>

              {/* Supporting Copy */}
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed">
                {isBn
                  ? "Study Abroad Consultant ঢাকাভিত্তিক একটি শিক্ষা পরামর্শ প্রতিষ্ঠান। আমরা বাংলাদেশি শিক্ষার্থী ও তাদের পরিবারকে আন্তর্জাতিক উচ্চশিক্ষার পরিকল্পনায় সহায়তা করি। আমাদের সেবার মধ্যে রয়েছে ব্যক্তিগত কাউন্সেলিং, বিশ্ববিদ্যালয় ও কোর্স নির্বাচন, স্কলারশিপ গাইডেন্স, ভর্তি আবেদন সহায়তা, স্টুডেন্ট ভিসা প্রস্তুতি এবং প্রি-ডিপার্চার পরামর্শ।"
                  : "Study Abroad Consultant is a Dhaka-based education consultancy supporting Bangladeshi students and their families in planning international higher education. We provide individual counselling, university and course selection, scholarship guidance, admission application support, student visa preparation, and pre-departure guidance."}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#story"
                  className="btn-sunset inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-bold text-white shadow-md"
                >
                  <span>
                    {isBn ? "আমাদের গল্প দেখুন" : "Explore Our Story"}
                  </span>
                  <ArrowRight className="size-4" />
                </a>

                <Link
                  href={localizedHref("/eligibility-quiz", locale)}
                  className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold text-slate-800 shadow-xs transition-all hover:border-orange-300 hover:bg-white hover:text-orange-600"
                >
                  {isBn ? "ফ্রি প্রোফাইল মূল্যায়ন" : "Free Profile Assessment"}
                </Link>
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
              <EducationJourneyIllustration />
            </motion.div>
          </div>
        </PageShell>
      </section>

      <section
        aria-label={
          isBn ? "প্রতিষ্ঠানের সংক্ষিপ্ত পরিচয়" : "Company at a glance"
        }
        className="border-b border-stone-200 bg-white"
      >
        <PageShell>
          <dl className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: isBn ? "প্রতিষ্ঠিত" : "Established",
                value: isBn ? "ফেব্রুয়ারি ২০২৬" : "February 2026",
              },
              {
                label: isBn ? "অবস্থান" : "Based in",
                value: isBn ? "নিকুঞ্জা-২, ঢাকা" : "Nikunja-2, Dhaka",
              },
              {
                label: isBn ? "যাদের জন্য কাজ করি" : "Who we support",
                value: isBn
                  ? "বাংলাদেশি শিক্ষার্থী ও পরিবার"
                  : "Bangladeshi students & families",
              },
              {
                label: isBn ? "টিমের অভিজ্ঞতা" : "Team experience",
                value: isBn
                  ? "চীন উচ্চশিক্ষায় ৮+ বছর"
                  : "8+ years in China education",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border-l-2 border-orange-200 pl-4"
              >
                <dt className="text-xs font-medium text-slate-500">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          <nav
            aria-label={isBn ? "এই পৃষ্ঠার বিভাগসমূহ" : "On this page"}
            className="flex flex-wrap gap-x-6 gap-y-3 border-t border-stone-200 py-5"
          >
            {[
              ["story", isBn ? "আমাদের গল্প" : "Our story"],
              ["purpose", isBn ? "লক্ষ্য ও দিকনির্দেশনা" : "Mission & vision"],
              ["commitments", isBn ? "আমাদের অঙ্গীকার" : "Our commitments"],
              ["destinations", isBn ? "গন্তব্যসমূহ" : "Destinations"],
              ["services", isBn ? "সেবাসমূহ" : "Services"],
              ["ceo-message", isBn ? "সিইওর বার্তা" : "CEO’s message"],
              ["team", isBn ? "আমাদের টিম" : "Leadership"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="focus-ring rounded text-xs font-semibold text-slate-600 transition-colors hover:text-[var(--brand-blue)]"
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
        className="relative scroll-mt-20 border-b border-stone-200/80 bg-white py-16 sm:py-24"
      >
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
              <span>{isBn ? "বাস্তব ইতিহাস ও পথচলা" : "OUR STORY"}</span>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "চীনের অভিজ্ঞতা থেকে আন্তর্জাতিক উচ্চশিক্ষার পথচলা।"
                : "China experience. A broader education journey."}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "ঢাকায় চীন-কেন্দ্রিক শিক্ষা পরামর্শ সেবায় আমাদের টিমের আট বছরেরও বেশি অভিজ্ঞতার ভিত্তিতে নতুন ব্র্যান্ড পরিচয়ে আমাদের পথচলা।"
                : "Our new brand identity builds on more than eight years of China-focused education consultancy work carried out by our team in Dhaka."}
            </p>
          </div>

          {/* Editorial Story narrative card */}
          <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-stone-200/90 bg-stone-50/60 p-6 sm:p-10">
            <div className="prose prose-slate max-w-none space-y-4 text-base leading-relaxed text-slate-700">
              <p>
                {isBn
                  ? "ঢাকা থেকেই আমাদের টিমের আন্তর্জাতিক উচ্চশিক্ষা পরামর্শ সেবার পথচলা শুরু হয়, চীনে উচ্চশিক্ষার সুযোগকে কেন্দ্র করে।"
                  : "Our team’s international education work began in Dhaka, with a focus on study opportunities in China."}
              </p>
              <p>
                {isBn
                  ? "আট বছরেরও বেশি সময় ধরে আমাদের টিমের সদস্যরা ঢাকায় পূর্ববর্তী একটি প্রতিষ্ঠানের মাধ্যমে চীন-কেন্দ্রিক উচ্চশিক্ষা কনসালটেন্সিতে নিষ্ঠার সাথে কাজ করেছেন। এই দীর্ঘ সময়ে তারা চীনা বিশ্ববিদ্যালয়ে সরাসরি ভর্তি, সরকারি ও বিশ্ববিদ্যালয় স্কলারশিপের নিয়মাবলী, JW201/JW202 নথিপত্র প্রস্তুতকরণ এবং শিক্ষার্থীদের সুনির্দিষ্ট শিক্ষাপরিকল্পনায় বাস্তব অভিজ্ঞতা অর্জন করেছেন।"
                  : "Members of our team bring more than eight years of China-focused education consultancy experience gained through an earlier business in Dhaka. Their work covered university admissions, scholarship guidance, student documentation, and education planning."}
              </p>
              <p>
                {isBn
                  ? "ফেব্রুয়ারি ২০২৬-এ ঢাকায় পরিচালিত সেই কাজকে Study Abroad Consultant নামে নতুন ব্র্যান্ড পরিচয়ে সম্প্রসারিত করি, আরও বেশি আন্তর্জাতিক গন্তব্যে উচ্চশিক্ষা সেবা দেওয়ার উদ্দেশ্যে।"
                  : "In February 2026, we expanded this Dhaka-based work under the new brand identity Study Abroad Consultant, extending our services to more international study destinations."}
              </p>
              <p>
                {isBn
                  ? "আজ আমরা বাংলাদেশি শিক্ষার্থীদের চীন ছাড়াও ভারত, মালয়েশিয়া, দক্ষিণ কোরিয়া এবং জাপানে বাস্তবসম্মত উচ্চশিক্ষার সুযোগগুলো অনুসন্ধানে নির্ভরযোগ্য সহায়তা প্রদান করছি।"
                  : "Today, we help Bangladeshi students explore opportunities in China, India, Malaysia, South Korea, and Japan."}
              </p>
            </div>
          </div>

          {/* Timeline Illustration */}
          <div className="mt-12">
            <TimelineJourneyIllustration locale={locale} />
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
                  ? "ব্যক্তিগত কাউন্সেলিং, স্পষ্ট তথ্য এবং আবেদন প্রস্তুতিতে ব্যবহারিক সহায়তার মাধ্যমে বাংলাদেশি শিক্ষার্থী ও পরিবারকে উচ্চশিক্ষার সিদ্ধান্ত নিতে সাহায্য করা।"
                  : "To help Bangladeshi students and families make informed higher education decisions through individual counselling, clear information, and practical application support."}
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
                  ? "শিক্ষার্থী কাউন্সেলিংয়ের মান ও প্রাতিষ্ঠানিক সম্পর্ক উন্নয়নের মাধ্যমে আরও বেশি বাংলাদেশি পরিবারের কাছে আন্তর্জাতিক উচ্চশিক্ষার সুযোগকে সহজবোধ্য করে তোলা।"
                  : "To make international education opportunities easier to understand and navigate for more Bangladeshi families, while strengthening our counselling standards and institutional relationships."}
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
                      {isBn ? "শিক্ষার্থীকে বোঝা" : "Understand the Student"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {isBn
                        ? "শিক্ষাগত রেকর্ড, পারিবারিক বাজেট (বিডিটিতে), একাডেমিক আগ্রহ এবং দীর্ঘমেয়াদী ক্যারিয়ার লক্ষ্য পুঙ্খানুপুঙ্খভাবে মূল্যায়ন করি।"
                        : "We discuss your academic record, subject interests, language qualifications, and family budget before recommending options."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-700">
                    02
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      {isBn
                        ? "উপযুক্ত সুযোগগুলো অনুসন্ধান"
                        : "Explore Suitable Opportunities"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {isBn
                        ? "বাস্তবসম্মত প্রবেশাধিকার, আসল টিউশন খরচ এবং ন্যায্য স্কলারশিপের সম্ভাবনা নিয়ে বিভিন্ন দেশের তুলনা করে সেরা বিকল্প খুঁজে নিই।"
                        : "We compare suitable programmes, published entry requirements, estimated costs, and scholarship eligibility with you."}
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
                        ? "পরবর্তী পদক্ষেপগুলো স্পষ্টভাবে জানানো"
                        : "Explain the Next Steps"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {isBn
                        ? "আবেদনের ধাপ, প্রয়োজনীয় কাগজপত্র, সম্ভাব্য খরচ ও সময়সীমা বুঝিয়ে দিই। ভর্তি, স্কলারশিপ এবং ভিসার চূড়ান্ত সিদ্ধান্ত সংশ্লিষ্ট প্রতিষ্ঠান ও কর্তৃপক্ষের।"
                        : "We explain application steps, required documents, estimated fees, and relevant deadlines. Admission, scholarship, and visa decisions remain with the issuing institutions and authorities."}
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
          SECTION 4 — STUDY DESTINATIONS: Opening Doors to International Education
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
                : "Opening Doors to International Education"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "আমাদের কাউন্সেলিং সেবার আওতায় থাকা গন্তব্যগুলো জানুন। প্রতিষ্ঠান ও সেশন অনুযায়ী প্রোগ্রামের সুযোগ এবং আবেদনের শর্ত ভিন্ন হয়।"
                : "Explore the destinations covered by our counselling services. Programme availability and application requirements vary by institution and intake."}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* China */}
            <div className="marketing-glass-card relative rounded-2xl p-7 transition-all hover:border-orange-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-semibold text-slate-900">
                  🇨🇳 {isBn ? "চীন" : "China"}
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-[0.7rem] font-bold text-orange-800">
                  {isBn ? "৮+ বছরের মূল ভিত্তি" : "8+ Years Core Focus"}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                {isBn
                  ? "আমাদের দীর্ঘতম বাস্তব অভিজ্ঞতা"
                  : "Our Longest-Standing Area of Experience"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "বিশ্ববিদ্যালয়ে ভর্তি, সরকারি ও প্রাদেশিক স্কলারশিপের সুযোগ এবং JW201/JW202 ভিসা ডকুমেন্টেশনে শতভাগ পেশাদার গাইডেন্স।"
                  : "Support with university applications, government and university scholarship options, JW201/JW202 documentation, and student visa preparation."}
              </p>
            </div>

            {/* India */}
            <div className="marketing-glass-card relative rounded-2xl p-7 transition-all hover:border-emerald-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-semibold text-slate-900">
                  🇮🇳 {isBn ? "ভারত" : "India"}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[0.7rem] font-bold text-emerald-800">
                  {isBn ? "ভর্তি গাইডেন্স" : "Admission Guidance"}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                {isBn
                  ? "ভর্তি আবেদন ও স্কলারশিপ সহায়তা"
                  : "Admission Applications & Scholarship Guidance"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "বিশ্ববিদ্যালয় ও কোর্স নির্বাচন, ভর্তি আবেদন, উপলব্ধ টিউশন ফি ছাড় এবং স্টুডেন্ট ভিসা প্রস্তুতিতে সহায়তা। সেবার পরিধি ও প্রযোজ্য খরচ আমাদের টিমের সাথে আলোচনা করুন।"
                  : "Support with university and course selection, admission applications, available tuition fee waivers, and student visa preparation. Discuss the service scope and applicable costs with our team."}
              </p>
            </div>

            {/* Malaysia */}
            <div className="marketing-glass-card relative rounded-2xl p-7 transition-all hover:border-sky-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-semibold text-slate-900">
                  🇲🇾 {isBn ? "মালয়েশিয়া" : "Malaysia"}
                </span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-[0.7rem] font-bold text-sky-800">
                  EMGS & Dual Degrees
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                {isBn
                  ? "গ্লোবাল ক্যাম্পাস ও আন্তর্জাতিক ক্যারিয়ার"
                  : "University Admission & Student Pass Support"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "বিশ্বমানের পাবলিক ও প্রাইভেট বিশ্ববিদ্যালয়ে ভর্তির যোগ্যতা, টিউশন খরচ, EMGS স্টুডেন্ট পাস প্রসেসিং এবং যুক্তরাজ্য/অস্ট্রেলিয়ান টুইনিং প্রোগ্রাম।"
                  : "Guidance on university options, entry requirements, tuition costs, admission applications, and student pass documentation."}
              </p>
            </div>

            {/* South Korea */}
            <div className="marketing-glass-card relative rounded-2xl p-7 transition-all hover:border-purple-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-semibold text-slate-900">
                  🇰🇷 {isBn ? "দক্ষিণ কোরিয়া" : "South Korea"}
                </span>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-[0.7rem] font-bold text-purple-800">
                  D-2 / D-4 Visa
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                {isBn
                  ? "হাই-টেক শিক্ষা ও স্কলারশিপের সুযোগ"
                  : "High-Tech Programs & GKS Pathways"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "উপযুক্ত একাডেমিক প্রোগ্রাম, সরকারি ও প্রাতিষ্ঠানিক স্কলারশিপ, কোরিয়ান ল্যাঙ্গুয়েজ ট্রেনিং (TOPIK/IELTS) এবং সুনির্দিষ্ট ভিসা প্রস্তুতি।"
                  : "Guidance on suitable undergraduate & graduate degrees, scholarship applications, language criteria, and meticulous Korean embassy visa filing."}
              </p>
            </div>

            {/* Japan */}
            <div className="marketing-glass-card relative rounded-2xl p-7 transition-all hover:border-rose-300 hover:shadow-md sm:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-semibold text-slate-900">
                  🇯🇵 {isBn ? "জাপান" : "Japan"}
                </span>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-[0.7rem] font-bold text-rose-800">
                  {isBn ? "নতুন দিগন্ত" : "Academic Excellence"}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                {isBn
                  ? "মানসম্মত শিক্ষা ও আধুনিক প্রযুক্তি"
                  : "Specialized Guidance for Academic Opportunities"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "জাপানের বিশিষ্ট শিক্ষা প্রতিষ্ঠানগুলোতে উপযুক্ত কোর্স নির্বাচন, ভর্তি আবেদনের যোগ্যতা, COE সংক্রান্ত প্রস্তুতি এবং প্রয়োজনীয় দিকনির্দেশনা।"
                  : "Guidance for Bangladeshi students exploring suitable academic opportunities in Japan, clarifying language expectations, eligibility prerequisites, and application procedures."}
              </p>
            </div>
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
          SECTION 5 — WHAT WE HELP WITH: Support Beyond University Selection
          ========================================================================= */}
      <section
        id="services"
        className="relative scroll-mt-28 border-b border-stone-200/80 bg-stone-50/60 py-16 sm:py-24"
      >
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
              <span>{isBn ? "আমাদের সেবাসমূহ" : "COMPREHENSIVE SERVICES"}</span>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "শুধু বিশ্ববিদ্যালয় নির্বাচন নয়, সার্বিক সহায়তা"
                : "Support Beyond University Selection"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "প্রথম কাউন্সেলিং থেকে যাত্রার প্রস্তুতি পর্যন্ত আপনার আবেদনের প্রতিটি ধাপে নির্দিষ্ট সহায়তা।"
                : "From the first consultation to preparing for departure, each service has a practical purpose in your application journey."}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1 */}
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <Compass className="size-5" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn
                  ? "১. স্টুডেন্ট প্রোফাইল মূল্যায়ন"
                  : "1. Student Profile Assessment"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "শিক্ষাগত রেকর্ড, ভাষা স্কোর ও আর্থিক সামর্থ্যের বাস্তবভিত্তিক বিশ্লেষণ।"
                  : "A review of your academic record, language qualifications, study history, and budget to identify suitable study options."}
              </p>
            </div>

            {/* 2 */}
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <BookOpen className="size-5" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn
                  ? "২. বিশ্ববিদ্যালয় ও কোর্স নির্বাচন"
                  : "2. University & Course Selection"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "শিক্ষার্থীর ক্যারিয়ার আকাঙ্ক্ষার সাথে সামঞ্জস্যপূর্ণ প্রতিষ্ঠানের তালিকা প্রণয়ন।"
                  : "A shortlist of universities and courses based on your interests, entry eligibility, career plans, and estimated costs."}
              </p>
            </div>

            {/* 3 */}
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Award className="size-5" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn ? "৩. স্কলারশিপ গাইডেন্স" : "3. Scholarship Guidance"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "উপলব্ধ সরকারি ও প্রাতিষ্ঠানিক বৃত্তির নিয়মাবলী ও বাস্তব আবেদন পদ্ধতি।"
                  : "An explanation of scholarship options, eligibility, required documents, and application steps for relevant programmes."}
              </p>
            </div>

            {/* 4 */}
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <FileText className="size-5" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn
                  ? "৪. ভর্তি আবেদন সহায়তা"
                  : "4. Admission Application Support"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "অ্যাকাডেমিক কাগজপত্র যাচাই, এসওপি নিরীক্ষণ ও সময়মতো সঠিক আবেদন দাখিল।"
                  : "Help checking academic documents, preparing study plans, and completing applications through the relevant submission channels."}
              </p>
            </div>

            {/* 5 */}
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <FileCheck2 className="size-5" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn
                  ? "৫. স্টুডেন্ট ভিসা প্রস্তুতি"
                  : "5. Student Visa Preparation"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "দূতাবাসের নির্দিষ্ট চেকলিস্ট অনুযায়ী ফাইল প্রস্তুত ও সঠিক ব্যাংকিং দিকনির্দেশনা।"
                  : "Support organising application forms and supporting documents against the relevant student visa checklist."}
              </p>
            </div>

            {/* 6 */}
            <div className="marketing-glass-card rounded-2xl p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <PlaneTakeoff className="size-5" />
              </div>
              <h3 className="font-heading mt-4 text-base font-bold text-slate-900">
                {isBn
                  ? "৬. বাসস্থান ও প্রাক-যাত্রা ব্রিফিং"
                  : "6. Accommodation & Pre-Departure"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isBn
                  ? "বাসস্থানের বিকল্প, প্রয়োজনীয় জিনিসপত্র, ভ্রমণ প্রস্তুতি এবং ক্যাম্পাসে পৌঁছানোর ব্যবস্থা নিয়ে পরামর্শ।"
                  : "Guidance on accommodation options, packing, travel preparation, and arrangements for arriving at your campus."}
              </p>
            </div>
          </div>
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
              <div className="mt-6 flex aspect-[4/3] max-w-sm items-center justify-center rounded-2xl border border-slate-300/60 bg-[var(--brand-navy)] text-white">
                <div className="text-center">
                  <span
                    aria-hidden="true"
                    className="font-serif text-7xl tracking-tight text-white/90"
                  >
                    RH
                  </span>
                  <div
                    aria-hidden="true"
                    className="mx-auto mt-5 h-px w-12 bg-orange-400"
                  />
                  <p className="mt-5 text-xs tracking-[0.18em] text-white/65 uppercase">
                    CEO &amp; Co-founder
                  </p>
                </div>
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
                  ? "আপনার উচ্চশিক্ষার সিদ্ধান্তে আমাদের দায়িত্ব।"
                  : "Your education deserves thoughtful guidance."}
              </h2>
              <div className="mt-7 space-y-5 text-base leading-8 text-slate-600">
                <p>
                  {isBn
                    ? "বিদেশে উচ্চশিক্ষার সিদ্ধান্তের সাথে একজন শিক্ষার্থীর স্বপ্ন এবং তার পরিবারের প্রত্যাশা জড়িয়ে থাকে। তাই একজন পরামর্শদাতার প্রথম দায়িত্ব হলো মনোযোগ দিয়ে শোনা—শিক্ষার্থী কী পড়তে চায়, তার প্রস্তুতি কেমন এবং পরিবার কোন বাজেটের মধ্যে পরিকল্পনা করছে।"
                    : "Choosing to study abroad brings together a student’s ambitions and a family’s hopes for the future. I believe our first responsibility as advisers is to listen: to understand what a student wants to study, how they are prepared, and the budget their family is planning around."}
                </p>
                <p>
                  {isBn
                    ? "আমাদের টিম ঢাকা থেকে আট বছরেরও বেশি সময় ধরে চীন-কেন্দ্রিক উচ্চশিক্ষা পরামর্শ সেবায় কাজ করেছে। ফেব্রুয়ারি ২০২৬-এ আমরা সেই অভিজ্ঞতাকে Study Abroad Consultant নামে নতুন ব্র্যান্ড পরিচয়ে সম্প্রসারিত করি। গন্তব্যের পরিধি বেড়েছে; ব্যক্তিগত মনোযোগ এবং দায়িত্বশীল পরামর্শের গুরুত্ব আমাদের কাছে একই আছে।"
                    : "Our team spent more than eight years working in China-focused education consultancy from Dhaka. In February 2026, we expanded that experience under a new brand identity, Study Abroad Consultant. Our range of destinations has grown, while personal attention and responsible advice remain central to how we work."}
                </p>
                <p>
                  {isBn
                    ? "আমরা চাই শিক্ষার্থী ও তার পরিবার বিশ্ববিদ্যালয়ের বিকল্প, আবেদনের শর্ত, সম্ভাব্য খরচ এবং পরবর্তী ধাপগুলো বুঝে সিদ্ধান্ত নিক। ভর্তি, স্কলারশিপ ও ভিসার ফলাফল সংশ্লিষ্ট কর্তৃপক্ষ নির্ধারণ করে; আমাদের কাজ হলো যথাযথ প্রস্তুতি ও স্পষ্ট দিকনির্দেশনায় সহায়তা করা। আপনার উচ্চশিক্ষার পরিকল্পনা আমাদের সাথে শেয়ার করার জন্য আপনাকে স্বাগতম।"
                    : "We want students and their families to understand their university options, application requirements, likely costs, and next steps before making a commitment. Universities and the relevant authorities determine admission, scholarship, and visa outcomes; our role is to support careful preparation and informed decisions. I welcome you to share your study plans with our team."}
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
          SECTION 6 — MEET OUR LEADERSHIP: The People Behind Study Abroad Consultant
          ========================================================================= */}
      <section
        id="team"
        className="relative scroll-mt-28 border-b border-stone-200/80 bg-white py-16 sm:py-24"
      >
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
              <span>{isBn ? "আমাদের নেতৃত্ব" : "LEADERSHIP TEAM"}</span>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "স্টাডি অ্যাব্রড কনসালটেন্সির পেছনের মানুষেরা"
                : "The People Behind Study Abroad Consultant"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "আমাদের প্রতিষ্ঠানের পরিচালনা, কাউন্সেলিং ও দৈনন্দিন কার্যক্রমের দায়িত্বে থাকা মানুষদের পরিচয় জানুন।"
                : "Meet the people responsible for our agency’s direction, counselling, and day-to-day operations."}
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Engr. MD Rakib Hasan */}
            <div className="marketing-glass-card rounded-2xl p-8 transition-all hover:border-orange-300 hover:shadow-md">
              <LeadershipAvatar
                name="Engr. MD Rakib Hasan"
                role={
                  isBn
                    ? "প্রধান নির্বাহী কর্মকর্তা ও সহ-প্রতিষ্ঠাতা"
                    : "CEO & Co-founder"
                }
                initials="RH"
                gradientClass="from-slate-900 via-slate-800 to-orange-950"
                imageSrc="/images/ceo-rakib-hasan.jpg"
              />
              <p className="mt-4 text-center text-sm leading-6 text-slate-600">
                {isBn
                  ? "কৌশলগত নেতৃত্ব ও আন্তর্জাতিক উচ্চশিক্ষা সম্প্রসারণের দায়িত্বে নিয়োজিত।"
                  : "Responsible for the agency’s strategic direction and development of its international education services."}
              </p>
            </div>

            {/* 2. MD Didarul Islam Nishad */}
            <div className="marketing-glass-card rounded-2xl p-8 transition-all hover:border-orange-300 hover:shadow-md">
              <LeadershipAvatar
                name="MD Didarul Islam Nishad"
                role={
                  isBn
                    ? "কাউন্সেলিং ও পার্টনারশিপ প্রধান"
                    : "Head of Counselling & Partnerships"
                }
                initials="DN"
                gradientClass="from-slate-900 via-slate-800 to-amber-950"
              />
              <p className="mt-4 text-center text-sm leading-6 text-slate-600">
                {isBn
                  ? "শিক্ষার্থীদের প্রোফাইল মূল্যায়ন, বিশ্ববিদ্যালয় অংশীদারিত্ব ও সামগ্রিক কাউন্সেলিং তত্ত্বাবধায়ক।"
                  : "Overseeing student profile assessments, institutional partnerships, and counselor standards."}
              </p>
            </div>

            {/* 3. MD Ramim Shahriar Rahat */}
            <div className="marketing-glass-card rounded-2xl p-8 transition-all hover:border-orange-300 hover:shadow-md sm:col-span-2 lg:col-span-1">
              <LeadershipAvatar
                name="MD Ramim Shahriar Rahat"
                role={
                  isBn
                    ? "অপারেশনস ও প্রশাসন প্রধান"
                    : "Head of Operations & Administration"
                }
                initials="RR"
                gradientClass="from-slate-900 via-slate-800 to-sky-950"
              />
              <p className="mt-4 text-center text-sm leading-6 text-slate-600">
                {isBn
                  ? "অফিস প্রশাসন, অ্যাপ্লিকেশন ফাইল ট্র্যাকিং ও শিক্ষার্থী সহায়তা প্রক্রিয়ার সার্বিক সমন্বয়ক।"
                  : "Managing operational workflows, documentation tracking, and student support delivery."}
              </p>
            </div>
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

                <div className="mt-6 space-y-4 text-xs sm:text-sm">
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
                      <p className="text-xs text-slate-400">WhatsApp Direct</p>
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
                        href="https://studyabroadconsultantbd.com"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-white hover:text-sky-300"
                      >
                        studyabroadconsultantbd.com
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
