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
  ShieldAlert,
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
      {/* =========================================================================
          SECTION 1 — HERO: The Company Behind the Guidance
          ========================================================================= */}
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-gradient-to-b from-[#FAF8F5] via-white to-white pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Subtle grid and ambient backdrop */}
        <div className="bg-grid-dots pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="pointer-events-none absolute -top-24 -left-24 size-[460px] rounded-full bg-orange-400/10 blur-[130px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-1/3 -right-24 size-[480px] rounded-full bg-amber-400/10 blur-[130px]"
          aria-hidden="true"
        />

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
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-orange-50/95 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs backdrop-blur-md">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span>{isBn ? "আমাদের পরিচয়" : "GET TO KNOW US"}</span>
              </div>

              {/* Company Branding & Tagline */}
              <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                <span className="font-extrabold text-slate-900 uppercase">
                  Study Abroad Consultant
                </span>
                <span>•</span>
                <span className="font-semibold text-orange-600 italic">
                  Study Beyond Borders. Dream Beyond Limits.
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="font-heading mt-4 text-3xl leading-[1.12] font-black tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
                {isBn
                  ? "সঠিক গাইডেন্স থেকেই শুরু হয় প্রতিটি সফল উচ্চশিক্ষা যাত্রা।"
                  : "Every Study Abroad Journey Starts With the Right Guidance."}
              </h1>

              {/* 8+ Years Experience Highlight Badge */}
              <div className="mt-5 inline-flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50/90 px-4 py-2 text-xs font-bold text-amber-950 shadow-2xs">
                <Award className="size-4 text-amber-600" />
                <span>
                  {isBn
                    ? "৮+ বছরের চীন উচ্চশিক্ষা অভিজ্ঞতা থেকে গড়ে ওঠা প্রতিষ্ঠান"
                    : "8+ Years of China-Focused Education Experience"}
                </span>
              </div>

              {/* Supporting Copy */}
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed">
                {isBn
                  ? "বিদেশে উচ্চশিক্ষা গ্রহণ করা শিক্ষার্থী ও তাদের পুরো পরিবারের জন্য একটি অত্যন্ত গুরুত্বপূর্ণ সিদ্ধান্ত। সঠিক পরামর্শ, প্রত্যক্ষ ব্যক্তিগত কাউন্সেলিং, বিশ্ববিদ্যালয়ে ভর্তির প্রস্তুতি, স্কলারশিপ অনুসন্ধান এবং স্টুডেন্ট ভিসা প্রসেসিঙে সার্বিক সহায়তা দিয়ে আমরা এই পথচলাকে সহজ ও নির্ভুল করে তুলি।"
                  : "Studying abroad is a major decision for students and their families. We help make that decision easier through practical advice, individual counselling, and support with university admission, scholarships, and student visa preparation."}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#story"
                  className="btn-sunset inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{isBn ? "আমাদের গল্প দেখুন" : "Explore Our Story"}</span>
                  <ArrowRight className="size-4" />
                </a>

                <Link
                  href={localizedHref("/eligibility-quiz", locale)}
                  className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold text-slate-800 shadow-xs transition-all hover:border-orange-300 hover:bg-white hover:text-orange-600"
                >
                  {isBn
                    ? "ফ্রি প্রোফাইল মূল্যায়ন"
                    : "Free Profile Assessment"}
                </Link>
              </div>
            </motion.div>

            {/* Right Illustration (5 cols) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <EducationJourneyIllustration />
            </motion.div>
          </div>
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
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>{isBn ? "বাস্তব ইতিহাস ও পথচলা" : "OUR HERITAGE"}</span>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "আমাদের গল্প: অভিজ্ঞতার ভিত্তি, সীমান্তের ওপারে অগ্রগতি"
                : "Our Story: Built on Experience, Growing Beyond Borders"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "চীন উচ্চশিক্ষায় দীর্ঘ আট বছরের বেশি বাস্তব কাজের অভিজ্ঞতাকে এক নতুন পরিচয়ে রূপ দিয়ে আমরা শিক্ষার্থীদের আরও বিস্তৃত আন্তর্জাতিক গন্তব্যে পৌঁছে দিচ্ছি।"
                : "How eight years of hands-on China education consultancy laid the bedrock for a modern, transparent international admissions service."}
            </p>
          </div>

          {/* Editorial Story narrative card */}
          <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-stone-200/90 bg-stone-50/60 p-6 sm:p-10">
            <div className="prose prose-slate max-w-none space-y-4 text-base leading-relaxed text-slate-700">
              <p>
                {isBn
                  ? "আমাদের টিমের আন্তর্জাতিক উচ্চশিক্ষা কনসালটেন্সির মূল পথচলা শুরু হয় চীন দিয়ে।"
                  : "Our team's international education journey began with China."}
              </p>
              <p>
                {isBn
                  ? "আট বছরেরও বেশি সময় ধরে আমাদের টিমের সদস্যরা পূর্ববর্তী একটি প্রতিষ্ঠানের মাধ্যমে চীন-কেন্দ্রিক উচ্চশিক্ষা কনসালটেন্সিতে নিষ্ঠার সাথে কাজ করেছেন। এই দীর্ঘ সময়ে তারা চীনা বিশ্ববিদ্যালয়ে সরাসরি ভর্তি, সরকারি ও বিশ্ববিদ্যালয় স্কলারশিপের নিয়মাবলী, JW201/JW202 নথিপত্র প্রস্তুতকরণ এবং শিক্ষার্থীদের সুনির্দিষ্ট শিক্ষাপরিকল্পনায় বাস্তব অভিজ্ঞতা অর্জন করেছেন।"
                  : "For more than eight years, members of our team have worked in China-focused education consultancy through an earlier business, developing practical experience in university admissions, scholarship guidance, student documentation, and education planning."}
              </p>
              <p>
                {isBn
                  ? "পরবর্তীতে, সেই দীর্ঘদিনের পরীক্ষিত অভিজ্ঞতাকে চীনের সীমানা ছাড়িয়ে অন্যান্য দেশে সম্প্রসারিত করার লক্ষ্যেই ‘Study Abroad Consultant’ একটি নতুন প্রাতিষ্ঠানিক পরিচয় হিসেবে প্রতিষ্ঠিত হয়।"
                  : "Study Abroad Consultant was later established as a new business identity to extend that experience beyond China."}
              </p>
              <p>
                {isBn
                  ? "আজ আমরা বাংলাদেশি শিক্ষার্থীদের চীন ছাড়াও ভারত, মালয়েশিয়া, দক্ষিণ কোরিয়া এবং জাপানে বাস্তবসম্মত উচ্চশিক্ষার সুযোগগুলো অনুসন্ধানে নির্ভরযোগ্য সহায়তা প্রদান করছি।"
                  : "Today, we help Bangladeshi students explore opportunities in China, India, Malaysia, South Korea, and Japan."}
              </p>
              <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-sm font-medium text-orange-950">
                <strong>
                  {isBn ? "গুরুত্বপূর্ণ স্বচ্ছতা:" : "Important Clarity:"}
                </strong>{" "}
                {isBn
                  ? "আমাদের বর্তমান ‘Study Abroad Consultant’ নামটি একটি নতুন পরিচয় যা আমাদের অভিজ্ঞতার পরবর্তী অধ্যায়কে তুলে ধরে। এটি আমাদের কাজের শুরু নয়, বরং চীন-কেন্দ্রিক উচ্চশিক্ষায় আমাদের টিমের দীর্ঘ আট বছরেরও বেশি বাস্তব অভিজ্ঞতার এক সুদৃঢ় সম্প্রসারণ।"
                  : "Our new company identity represents the next chapter of our journey, not the beginning of our experience in China-focused education services."}
              </div>
            </div>
          </div>

          {/* Timeline Illustration */}
          <div className="mt-12">
            <TimelineJourneyIllustration />
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
          SECTION 3 — OUR APPROACH: We Start With the Student, Not the University
          ========================================================================= */}
      <section className="relative border-b border-stone-200/80 bg-stone-50/60 py-16 sm:py-24">
        <PageShell>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Left Content (6.5 cols) */}
            <div className="flex flex-col lg:col-span-7">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span>
                  {isBn ? "আমাদের কাউন্সেলিং দর্শন" : "OUR COUNSELLING PHILOSOPHY"}
                </span>
              </div>

              <h2 className="font-heading mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {isBn
                  ? "আমরা শুরু করি শিক্ষার্থীকে দিয়ে, কোনো বিশ্ববিদ্যালয় দিয়ে নয়।"
                  : "We Start With the Student, Not the University."}
              </h2>

              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                {isBn
                  ? "বাণিজ্যিক এজেন্সির মতো মুখস্থ বিশ্ববিদ্যালয়ের নাম চাপিয়ে দেওয়ার পরিবর্তে, আমরা শিক্ষার্থীর রেজাল্ট, কাঙ্ক্ষিত ডিগ্রি, পারিবারিক বাজেট, পছন্দের বিষয়, ভাষার দক্ষতা এবং ভবিষ্যৎ ক্যারিয়ার পরিকল্পনা বিস্তারিত বিশ্লেষণ করে তবেই পরামর্শ দিই।"
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
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {isBn
                        ? "শিক্ষাগত রেকর্ড, পারিবারিক বাজেট (বিডিটিতে), একাডেমিক আগ্রহ এবং দীর্ঘমেয়াদী ক্যারিয়ার লক্ষ্য পুঙ্খানুপুঙ্খভাবে মূল্যায়ন করি।"
                        : "We review academic transcripts, family budget in BDT, subject passion, and future plans before making any recommendation."}
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
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {isBn
                        ? "বাস্তবসম্মত প্রবেশাধিকার, আসল টিউশন খরচ এবং ন্যায্য স্কলারশিপের সম্ভাবনা নিয়ে বিভিন্ন দেশের তুলনা করে সেরা বিকল্প খুঁজে নিই।"
                        : "We evaluate matching universities, genuine tuition costs, and verified scholarship criteria across relevant countries."}
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
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {isBn
                        ? "কোনো মিথ্যা প্রতিশ্রুতি নয়—কাগজপত্র প্রস্তুত, ফি পাঠানোর নিয়ম, সময়সীমা এবং ভিসার প্রকৃত প্রক্রিয়া পরিবারকে স্পষ্টভাবে বুঝিয়ে দিই।"
                        : "We provide an honest document roadmap, application timeline, banking procedures, and visa requirements with zero guesswork."}
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
      <section className="relative border-b border-stone-200/80 bg-white py-16 sm:py-24">
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>{isBn ? "অধ্যয়ন গন্তব্যসমূহ" : "ACTIVE STUDY DESTINATIONS"}</span>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "আন্তর্জাতিক উচ্চশিক্ষার দ্বার উন্মোচন"
                : "Opening Doors to International Education"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "যেসব দেশে আমাদের সুনির্দিষ্ট ভর্তি অভিজ্ঞতা ও প্রসেসিং দক্ষতা রয়েছে—কোনো অসত্য রেটিং বা অসম্ভব গ্যারান্টি ছাড়া।"
                : "Ground-level expertise across five dynamic Asian education hubs. Transparent requirements, genuine fees, and realistic pathways."}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* China */}
            <div className="relative rounded-3xl border border-stone-200 bg-white p-7 shadow-2xs transition-all hover:border-orange-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-black text-slate-900">
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
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {isBn
                  ? "বিশ্ববিদ্যালয়ে ভর্তি, সরকারি ও প্রাদেশিক স্কলারশিপের সুযোগ এবং JW201/JW202 ভিসা ডকুমেন্টেশনে শতভাগ পেশাদার গাইডেন্স।"
                  : "Guidance for university admissions, verified government & university scholarships, JW201/JW202 documentation, and student visa files."}
              </p>
            </div>

            {/* India */}
            <div className="relative rounded-3xl border border-stone-200 bg-white p-7 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-black text-slate-900">
                  🇮🇳 {isBn ? "ভারত" : "India"}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[0.7rem] font-bold text-emerald-800">
                  {isBn ? "০ সার্ভিস চার্জ" : "Zero Agency Service Charge"}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                {isBn
                  ? "সরাসরি ভর্তি ও স্কলারশিপ সহায়তা"
                  : "Direct Admission & Merit Scholarships"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {isBn
                  ? "শীর্ষস্থানীয় ভারতীয় বিশ্ববিদ্যালয়ে কোর্স নির্বাচন, টিউশন স্কলারশিপ এবং স্টুডেন্ট ভিসা প্রস্তুতি। আমাদের বর্তমান ভারত কনসালটেন্সি সেবায় কোনো এজেন্সি সার্ভিস চার্জ নেই।"
                  : "Support for university selection, admission, available tuition fee waivers, and student visa preparation. Note: Our India consultancy currently carries no agency service charge."}
              </p>
            </div>

            {/* Malaysia */}
            <div className="relative rounded-3xl border border-stone-200 bg-white p-7 shadow-2xs transition-all hover:border-sky-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-black text-slate-900">
                  🇲🇾 {isBn ? "মালয়েশিয়া" : "Malaysia"}
                </span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-[0.7rem] font-bold text-sky-800">
                  EMGS & Dual Degrees
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900">
                {isBn
                  ? "গ্লোবাল ক্যাম্পাস ও আন্তর্জাতিক ক্যারিয়ার"
                  : "Global Standards & Fast Student Pass"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {isBn
                  ? "বিশ্বমানের পাবলিক ও প্রাইভেট বিশ্ববিদ্যালয়ে ভর্তির যোগ্যতা, টিউশন খরচ, EMGS স্টুডেন্ট পাস প্রসেসিং এবং যুক্তরাজ্য/অস্ট্রেলিয়ান টুইনিং প্রোগ্রাম।"
                  : "Comprehensive advice on university options, entry criteria, tuition costs, admission offers, and complete EMGS student pass clearance."}
              </p>
            </div>

            {/* South Korea */}
            <div className="relative rounded-3xl border border-stone-200 bg-white p-7 shadow-2xs transition-all hover:border-purple-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-black text-slate-900">
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
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {isBn
                  ? "উপযুক্ত একাডেমিক প্রোগ্রাম, সরকারি ও প্রাতিষ্ঠানিক স্কলারশিপ, কোরিয়ান ল্যাঙ্গুয়েজ ট্রেনিং (TOPIK/IELTS) এবং সুনির্দিষ্ট ভিসা প্রস্তুতি।"
                  : "Guidance on suitable undergraduate & graduate degrees, scholarship applications, language criteria, and meticulous Korean embassy visa filing."}
              </p>
            </div>

            {/* Japan */}
            <div className="relative rounded-3xl border border-stone-200 bg-white p-7 shadow-2xs transition-all hover:border-rose-300 hover:shadow-md sm:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-black text-slate-900">
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
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
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
      <section className="relative border-b border-stone-200/80 bg-stone-50/60 py-16 sm:py-24">
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>{isBn ? "আমাদের সেবাসমূহ" : "COMPREHENSIVE SERVICES"}</span>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "শুধু বিশ্ববিদ্যালয় নির্বাচন নয়, সার্বিক সহায়তা"
                : "Support Beyond University Selection"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "প্রাথমিক ফাইল যাচাই থেকে শুরু করে বিমানে ওঠা পর্যন্ত প্রতিটি ধাপে সুনির্দিষ্ট কাজ।"
                : "Six core stages handled with counselor accountability, ensuring your file moves forward smoothly."}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1 */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <Compass className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900">
                {isBn ? "১. স্টুডেন্ট প্রোফাইল মূল্যায়ন" : "1. Student Profile Assessment"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {isBn
                  ? "শিক্ষাগত রেকর্ড, ভাষা স্কোর ও আর্থিক সামর্থ্যের বাস্তবভিত্তিক বিশ্লেষণ।"
                  : "Objective evaluation of GPA, language qualifications, study gaps, and realistic family budget in BDT."}
              </p>
            </div>

            {/* 2 */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <BookOpen className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900">
                {isBn ? "২. বিশ্ববিদ্যালয় ও কোর্স নির্বাচন" : "2. University & Course Selection"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {isBn
                  ? "শিক্ষার্থীর ক্যারিয়ার আকাঙ্ক্ষার সাথে সামঞ্জস্যপূর্ণ প্রতিষ্ঠানের তালিকা প্রণয়ন।"
                  : "Shortlisting accredited institutions and degrees aligned with student ambitions and genuine job market demand."}
              </p>
            </div>

            {/* 3 */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Award className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900">
                {isBn ? "৩. স্কলারশিপ গাইডেন্স" : "3. Scholarship Guidance"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {isBn
                  ? "উপলব্ধ সরকারি ও প্রাতিষ্ঠানিক বৃত্তির নিয়মাবলী ও বাস্তব আবেদন পদ্ধতি।"
                  : "Clear information on available merit waivers, provincial grants, and realistic eligibility criteria."}
              </p>
            </div>

            {/* 4 */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <FileText className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900">
                {isBn ? "৪. ভর্তি আবেদন সহায়তা" : "4. Admission Application Support"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {isBn
                  ? "অ্যাকাডেমিক কাগজপত্র যাচাই, এসওপি নিরীক্ষণ ও সময়মতো সঠিক আবেদন দাখিল।"
                  : "Checking transcripts, refining study plans, and submitting files directly to university registries."}
              </p>
            </div>

            {/* 5 */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <FileCheck2 className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900">
                {isBn ? "৫. স্টুডেন্ট ভিসা প্রস্তুতি" : "5. Student Visa Preparation"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {isBn
                  ? "দূতাবাসের নির্দিষ্ট চেকলিস্ট অনুযায়ী ফাইল প্রস্তুত ও সঠিক ব্যাংকিং দিকনির্দেশনা।"
                  : "Building complete visa dossiers according to embassy regulations, official forms, and financial documentation."}
              </p>
            </div>

            {/* 6 */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <PlaneTakeoff className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900">
                {isBn ? "৬. বাসস্থান ও প্রাক-যাত্রা ব্রিফিং" : "6. Accommodation & Pre-Departure"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {isBn
                  ? "ডরমিটরি আসন নিশ্চিতকরণ, এয়ারপোর্ট নির্দেশিকা ও ক্যাম্পাসে পৌঁছানোর পরামর্শ।"
                  : "Hostel room booking assistance, packing checklists, currency guidance, and campus arrival protocols."}
              </p>
            </div>
          </div>

          {/* Transparent Regulatory Disclaimer */}
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950 sm:text-sm">
            <ShieldAlert className="size-5 shrink-0 text-amber-700" />
            <p>
              {isBn
                ? "স্বচ্ছ ঘোষণা: ভর্তি, স্কলারশিপ এবং ভিসা প্রদানের চূড়ান্ত সিদ্ধান্ত সর্বদা সংশ্লিষ্ট বিশ্ববিদ্যালয় ও অভিবাসন কর্তৃপক্ষের নিজস্ব এখতিয়ার। আমরা সঠিক প্রস্তুতি ও পেশাদার দিকনির্দেশনা দিয়ে সর্বোচ্চ সম্ভাবনা নিশ্চিত করতে কাজ করি।"
                : "Important Notice: Admission offers, scholarship awards, and visa approvals are decided solely by the respective universities and government immigration authorities. We provide rigorous preparation to maximize your success legitimately."}
            </p>
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
          SECTION 6 — MEET OUR LEADERSHIP: The People Behind Study Abroad Consultant
          ========================================================================= */}
      <section className="relative border-b border-stone-200/80 bg-white py-16 sm:py-24">
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>{isBn ? "আমাদের নেতৃত্ব" : "LEADERSHIP TEAM"}</span>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "স্টাডি অ্যাব্রড কনসালটেন্সির পেছনের মানুষেরা"
                : "The People Behind Study Abroad Consultant"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {isBn
                ? "কোনো কাল্পনিক ছবি বা বাণিজ্যিক কল সেন্টার নয়—যাদের প্রত্যক্ষ দিকনির্দেশনায় পরিচালিত হয় আমাদের প্রতিষ্ঠান।"
                : "Direct leadership accountability. Real counselors and operations directors overseeing every student file in Dhaka."}
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. SM Rahinur Alam Nihad */}
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-2xs transition-all hover:border-orange-300 hover:shadow-md">
              <LeadershipAvatar
                name="SM Rahinur Alam Nihad"
                role="Chief Executive Officer"
                initials="RN"
                gradientClass="from-slate-900 via-slate-800 to-orange-950"
              />
              <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">
                {isBn
                  ? "কৌশলগত নেতৃত্ব ও আন্তর্জাতিক উচ্চশিক্ষা সম্প্রসারণের দায়িত্বে নিয়োজিত।"
                  : "Leading institutional strategy, agency vision, and international study route expansion."}
              </p>
            </div>

            {/* 2. MD Didarul Islam Nishad */}
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-2xs transition-all hover:border-orange-300 hover:shadow-md">
              <LeadershipAvatar
                name="MD Didarul Islam Nishad"
                role="Head of Counselling & Partnerships"
                initials="DN"
                gradientClass="from-slate-900 via-slate-800 to-amber-950"
              />
              <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">
                {isBn
                  ? "শিক্ষার্থীদের প্রোফাইল মূল্যায়ন, বিশ্ববিদ্যালয় অংশীদারিত্ব ও সামগ্রিক কাউন্সেলিং তত্ত্বাবধায়ক।"
                  : "Overseeing student profile assessments, institutional partnerships, and counselor standards."}
              </p>
            </div>

            {/* 3. MD Ramim Shahriar Rahat */}
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-2xs transition-all hover:border-orange-300 hover:shadow-md sm:col-span-2 lg:col-span-1">
              <LeadershipAvatar
                name="MD Ramim Shahriar Rahat"
                role="Head of Operations & Administration"
                initials="RR"
                gradientClass="from-slate-900 via-slate-800 to-sky-950"
              />
              <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">
                {isBn
                  ? "অফিস প্রশাসন, অ্যাপ্লিকেশন ফাইল ট্র্যাকিং ও শিক্ষার্থী সহায়তা প্রক্রিয়ার সার্বিক সমন্বয়ক।"
                  : "Managing operational workflows, documentation tracking, and student support delivery."}
              </p>
            </div>
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
          SECTION 7 — HOW WE WORK AND WHAT WE BELIEVE: Practical Principles
          ========================================================================= */}
      <section className="relative border-b border-stone-200/80 bg-stone-900 py-16 text-white sm:py-24">
        <PageShell>
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-utility text-xs font-bold tracking-widest text-orange-400 uppercase">
              {isBn ? "আমাদের কর্মপদ্ধতি ও বিশ্বাস" : "HOW WE WORK & WHAT WE BELIEVE"}
            </span>
            <h2 className="font-heading mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {isBn
                ? "বাস্তবসম্মত নীতি, কোনো বিজ্ঞাপনী চটকদার কথা নয়"
                : "Grounded Principles, Not Empty Buzzwords"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              {isBn
                ? "আমরা ‘অলৌকিক সাফল্য’ বা ‘সীমাহীন গ্যারান্টি’ বিক্রি করি না। আমরা বাস্তবসম্মত কাজের মাধ্যমে প্রতিটি শিক্ষার্থীর ভবিষ্যৎ পরিকল্পনা সাজাই।"
                : "We avoid exaggerated slogans. Instead, we uphold three practical commitments that guide every conversation with Bangladeshi families."}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {/* Principle 1 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                <MessageCircle className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">
                {isBn ? "সততাপূর্ণ আলোচনা" : "Honest Conversations"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {isBn
                  ? "টিউশন খরচ, ভর্তির যোগ্যতা, নিয়মাবলী এবং বাস্তব সম্ভাবনা নিয়ে পরিবারকে খোলামেলা ও স্পষ্ট তথ্য দিই।"
                  : "We explain true costs in BDT, genuine eligibility criteria, and realistic admissions probabilities before any commitment."}
              </p>
            </div>

            {/* Principle 2 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Users className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">
                {isBn ? "ব্যক্তিগত মনোযোগ" : "Individual Attention"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {isBn
                  ? "প্রতিটি শিক্ষার্থীর আলাদা ব্যাকগ্রাউন্ড, আর্থিক সীমাবদ্ধতা ও লক্ষ্য বিবেচনা করে সুনির্দিষ্ট পথ তৈরি করি।"
                  : "We take time to understand each student's personal circumstances rather than pushing one-size-fits-all packages."}
              </p>
            </div>

            {/* Principle 3 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">
                {isBn ? "দায়িত্বশীল দিকনির্দেশনা" : "Responsible Guidance"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {isBn
                  ? "যেসব বিষয় আমাদের নিয়ন্ত্রণের বাইরে (যেমন ভিসা বা স্কলারশিপের ফলাফল), সেগুলোতে মিথ্যা প্রতিশ্রুতি না দিয়ে নির্ভুলভাবে প্রস্তুত করি।"
                  : "We help students prepare meticulously without making misleading guarantees outside our control."}
              </p>
            </div>
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
          SECTION 8 — OUR DIRECTION: The Next Chapter of Our Journey
          ========================================================================= */}
      <section className="relative border-b border-stone-200/80 bg-stone-50/60 py-16 sm:py-24">
        <PageShell>
          <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-2xs sm:p-12">
            <span className="font-utility text-xs font-bold tracking-widest text-orange-600 uppercase">
              {isBn ? "ভবিষ্যৎ লক্ষ্য" : "LOOKING FORWARD"}
            </span>
            <h2 className="font-heading mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {isBn
                ? "আমাদের পরবর্তী অধ্যায়ের মূল অভিমুখ"
                : "The Next Chapter of Our Journey"}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              <p>
                {isBn
                  ? "স্টাডি অ্যাব্রড কনসালটেন্সি তার দীর্ঘ চীন উচ্চশিক্ষা অভিজ্ঞতার ওপর ভিত্তি করে এগিয়ে চলছে, পাশাপাশি আন্তর্জাতিক উচ্চশিক্ষার আরও নতুন সম্ভাবনার পথ সুগম করছে।"
                  : "Study Abroad Consultant is building on its China education experience while developing broader international education services."}
              </p>
              <p>
                {isBn
                  ? "আমাদের একমাত্র লক্ষ্য হলো শিক্ষার্থী কাউন্সেলিংয়ের মান উন্নত করা, স্বনামধন্য বিশ্ববিদ্যালয়ের সাথে নির্ভরযোগ্য প্রাতিষ্ঠানিক সম্পর্ক গড়ে তোলা এবং বাংলাদেশি শিক্ষার্থী ও পরিবারের জন্য বিদেশে উচ্চশিক্ষার সিদ্ধান্ত গ্রহণকে সহজ ও নিরাপদ করা।"
                  : "Our intention is to improve student counselling, develop reliable institutional relationships, and make international education decisions easier for Bangladeshi students and families."}
              </p>
            </div>
          </div>
        </PageShell>
      </section>

      {/* =========================================================================
          SECTION 9 — FINAL CTA & OFFICE INFORMATION
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1E36] via-[#0E2849] to-[#071324] py-16 text-white sm:py-24">
        <div
          className="pointer-events-none absolute top-0 -right-20 size-96 rounded-full bg-orange-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 -left-20 size-96 rounded-full bg-sky-500/10 blur-3xl"
          aria-hidden="true"
        />

        <PageShell className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left CTA (7 cols) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>{isBn ? "পরামর্শ শুরু করুন" : "LET'S TALK"}</span>
              </div>

              <h2 className="font-heading mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
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
                  className="btn-sunset focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98]"
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
                    {isBn ? "হোয়াটসঅ্যাপে কাউন্সেলর" : "WhatsApp Our Counsellor"}
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
                      <p className="text-slate-400 text-xs">WhatsApp Direct</p>
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
                      <p className="text-slate-400 text-xs">Email</p>
                      <a
                        href="mailto:support@studyabroadconsultantbd.com"
                        className="break-all font-medium text-white hover:text-orange-300"
                      >
                        support@studyabroadconsultantbd.com
                      </a>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-start gap-3">
                    <Globe2 className="mt-0.5 size-4 shrink-0 text-sky-400" />
                    <div>
                      <p className="text-slate-400 text-xs">Website</p>
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
