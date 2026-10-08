"use client";

import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Users } from "lucide-react";
import * as motion from "framer-motion/client";

import { PageShell } from "@/components/layout/page-shell";
import { EducationJourneyIllustration } from "@/components/marketing/about-illustrations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";

interface HomeAboutSectionProps {
  locale: Locale;
  dict?: Dictionary;
}

export function HomeAboutSection({ locale }: HomeAboutSectionProps) {
  const isBn = locale === "bn";

  return (
    <section className="relative overflow-hidden border-b border-stone-200/80 bg-white py-16 sm:py-24">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute top-12 left-0 size-96 rounded-full bg-orange-500/5 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 bottom-12 size-96 rounded-full bg-amber-500/5 blur-[120px]"
        aria-hidden="true"
      />

      <PageShell>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column (5.5 cols): Custom Education 2D Vector Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <EducationJourneyIllustration />
              {/* Subtle caption pill */}
              <div className="mt-3 flex items-center justify-between px-2 text-[0.72rem] text-slate-400">
                <span>Dhaka Admissions Desk</span>
                <span className="font-semibold text-orange-600">
                  Nikunja-2, Khilkhet
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column (6.5 cols): Heading, Badge, Story & Value Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:col-span-7"
          >
            {/* Small Eyebrow Label */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs backdrop-blur-md">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>
                {isBn
                  ? "স্টাডি অ্যাব্রড কনসালটেন্সি সম্পর্কে"
                  : "ABOUT STUDY ABROAD CONSULTANT"}
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="font-heading mt-4 text-3xl leading-[1.15] font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {isBn
                ? "বিদেশে উচ্চশিক্ষায় আপনার বিশ্বস্ত সহযোগী"
                : "Your Trusted Partner for Studying Abroad"}
            </h2>

            {/* Experience Highlight Badge */}
            <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/90 px-3.5 py-1.5 text-xs font-bold text-amber-900 shadow-2xs">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>
                {isBn
                  ? "৮+ বছরের চীন উচ্চশিক্ষা অভিজ্ঞতা"
                  : "8+ Years of China-Focused Education Experience"}
              </span>
            </div>

            {/* Body Copy */}
            <div className="mt-5 space-y-3.5 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-relaxed">
              <p>
                {isBn
                  ? "স্টাডি অ্যাব্রড কনসালটেন্সিতে আমরা বাংলাদেশি শিক্ষার্থী ও তাদের পরিবারকে আন্তর্জাতিক উচ্চশিক্ষার বিষয়ে আত্মবিশ্বাসী সিদ্ধান্ত নিতে সাহায্য করি।"
                  : "At Study Abroad Consultant, we help Bangladeshi students and their families make confident decisions about international education."}
              </p>
              <p>
                {isBn
                  ? "সঠিক বিশ্ববিদ্যালয় নির্বাচন এবং স্কলারশিপের সুযোগ অনুসন্ধান থেকে শুরু করে ভর্তির কাগজপত্র প্রস্তুত ও স্টুডেন্ট ভিসা আবেদনের জটিল নিয়মকানুন সম্পন্ন করা পর্যন্ত—আমাদের টিম পুরো পথজুড়ে ব্যক্তিগত গাইডেন্স প্রদান করে।"
                  : "From choosing the right university and exploring scholarship opportunities to preparing admission documents and navigating student visa requirements, our team provides personalized guidance throughout the journey."}
              </p>
              <p>
                {isBn
                  ? "চীন-কেন্দ্রিক উচ্চশিক্ষা কনসালটেন্সিতে আট বছরেরও বেশি অভিজ্ঞতার ওপর ভিত্তি করে, আমরা আমাদের দক্ষতা ও সেবাকে আরও বেশি আন্তর্জাতিক গন্তব্য ও সম্ভাবনায় সম্প্রসারিত করছি।"
                  : "Building on more than eight years of experience in China-focused education consultancy, we are extending our expertise to more destinations and opportunities."}
              </p>
              <p className="font-medium text-slate-800">
                {isBn
                  ? "আমরা বিশ্বাস করি, কোনো বিশ্ববিদ্যালয়ের নাম প্রস্তাব করার আগে শিক্ষার্থীর সাথে কথা বলে তার শিক্ষাগত যোগ্যতা, উচ্চাকাঙ্ক্ষা ও পারিবারিক বাজেট সঠিকভাবে বোঝাটাই একজন সত্যিকারের কাউন্সেলরের প্রথম দায়িত্ব।"
                  : "We believe good counselling begins with understanding the student — their academic background, ambitions, and budget — before recommending a university."}
              </p>
            </div>

            {/* Three Compact Value Highlights */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-200/90 bg-stone-50/60 p-3.5 transition-colors hover:border-orange-300 hover:bg-orange-50/30">
                <div className="flex size-7 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                  <Compass className="size-4" />
                </div>
                <h4 className="mt-2 text-xs font-bold text-slate-900">
                  {isBn ? "ব্যক্তিগত পরামর্শ" : "Personalized Guidance"}
                </h4>
                <p className="mt-1 text-[0.72rem] leading-normal text-slate-500">
                  {isBn
                    ? "শিক্ষার্থীর যোগ্যতা ও বাজেটের সাথে সামঞ্জস্যপূর্ণ"
                    : "Tailored to profile, goals & family budget"}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200/90 bg-stone-50/60 p-3.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="size-4" />
                </div>
                <h4 className="mt-2 text-xs font-bold text-slate-900">
                  {isBn ? "স্বচ্ছ প্রক্রিয়া" : "Transparent Process"}
                </h4>
                <p className="mt-1 text-[0.72rem] leading-normal text-slate-500">
                  {isBn
                    ? "কোনো গোপন খরচ নেই, প্রতিটি ধাপ স্পষ্ট"
                    : "Zero hidden charges, clear document roadmap"}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200/90 bg-stone-50/60 p-3.5 transition-colors hover:border-sky-300 hover:bg-sky-50/30">
                <div className="flex size-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Users className="size-4" />
                </div>
                <h4 className="mt-2 text-xs font-bold text-slate-900">
                  {isBn ? "শুরু থেকে শেষ পর্যন্ত সহায়তা" : "End-to-End Support"}
                </h4>
                <p className="mt-1 text-[0.72rem] leading-normal text-slate-500">
                  {isBn
                    ? "ভর্তি, ভিসা, রেমিট্যান্স থেকে ক্যাম্পাসে পৌঁছানো"
                    : "From admissions to student visa & departure"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href={localizedHref("/about", locale)}
                className="btn-sunset inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{isBn ? "আমাদের গল্প জানুন" : "Discover Our Story"}</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href={localizedHref("/eligibility-quiz", locale)}
                className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold text-slate-800 shadow-xs transition-all hover:border-orange-300 hover:bg-white hover:text-orange-600"
              >
                {isBn ? "বিনামূল্যে প্রোফাইল মূল্যায়ন" : "Free Profile Assessment"}
              </Link>
            </div>
          </motion.div>
        </div>
      </PageShell>
    </section>
  );
}
