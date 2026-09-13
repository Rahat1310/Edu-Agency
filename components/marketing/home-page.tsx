import {
  ArrowRight,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";

import { LeadForm } from "@/components/lead-form";
import { DestinationCard } from "@/components/marketing/destination-card";
import { FeaturedSuccessStories } from "@/components/marketing/featured-success-stories";
import { HeroGlobe } from "@/components/marketing/hero-globe";
import { HeroFeaturesBar } from "@/components/marketing/hero-features-bar";
import { HeroFloatingArt } from "@/components/marketing/hero-floating-art";
import { JourneyRoadmap } from "@/components/marketing/journey-roadmap";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PageShell } from "@/components/layout/page-shell";
import {
  DESTINATIONS,
  DESTINATION_SLUGS,
  type DestinationSlug,
} from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import type { UpcomingIntakeCountdown } from "@/lib/intakes/countdown";
import type { SuccessStoryView } from "@/lib/success-stories/featured";
import { getWhatsAppHref } from "@/lib/whatsapp";

type HomePageProps = {
  locale: Locale;
  dict: Dictionary;
  countdowns?: Partial<Record<DestinationSlug, UpcomingIntakeCountdown>>;
  stories?: SuccessStoryView[];
  storiesOffset?: number;
};

export function HomePage({
  locale,
  dict,
  stories = [],
  storiesOffset = 0,
}: HomePageProps) {
  const whatsappHref = getWhatsAppHref(dict.chrome.whatsappMessage);

  return (
    <>
      {/* 🌟 Clean, Professional Centered Hero with Horizon Half-Globe */}
      <section className="relative flex flex-col items-center justify-between overflow-hidden border-b border-stone-200/80 bg-[#fafafa] pt-10 pb-0 sm:pt-16">
        {/* Subtle Modern Dot-Matrix Grid */}
        <div className="bg-grid-dots pointer-events-none absolute inset-0 opacity-40" />

        {/* Ambient Warm Sunset & Cyan Glow Orbs */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 size-[500px] rounded-full bg-amber-400/15 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-1/4 -right-32 size-[540px] rounded-full bg-orange-400/15 blur-[130px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 size-[680px] -translate-x-1/2 rounded-full bg-rose-400/10 blur-[150px]"
          aria-hidden="true"
        />

        {/* 🎨 Floating Vector Art Flanking Left and Right Wings */}
        <HeroFloatingArt locale={locale} />

        <PageShell className="relative z-10 flex w-full flex-col items-center text-center">
          {/* Top Centered Header Content: Clean, High Clarity, Zero Visual Clutter */}
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            {/* Minimal Clean Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-2xs backdrop-blur-md"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>
                {locale === "bn"
                  ? "স্প্রিং ২০২৭ সেশন অ্যাডমিশন"
                  : "Spring 2027 Admissions Open"}
              </span>
            </motion.div>

            {/* Simple, Punchy Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-heading mt-4 text-[2.5rem] leading-[1.1] font-black tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.08] lg:text-[3.8rem]"
            >
              {locale === "bn" ? (
                <>
                  বিশ্বের শীর্ষ বিশ্ববিদ্যালয়ে{" "}
                  <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    বাংলাদেশের নির্ভরযোগ্য সেতু
                  </span>
                </>
              ) : (
                <>
                  Bangladesh&apos;s Trusted Bridge to{" "}
                  <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    World&apos;s Top Universities
                  </span>
                </>
              )}
            </motion.h1>

            {/* Simple, Crisp Paragraph (2 lines max, centered) */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-4 max-w-2xl text-base leading-relaxed font-normal text-slate-600 sm:text-lg"
            >
              {locale === "bn"
                ? "আবেদন থেকে ভিসা — মালয়েশিয়া, চীন, দক্ষিণ কোরিয়া ও ভারতের জন্য পূর্ণাঙ্গ সেবা।"
                : "Full-service support — from application to visa — for Malaysia, China, South Korea & India."}
            </motion.p>

            {/* Clean Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3.5"
            >
              <Link
                href={localizedHref("/contact", locale)}
                className="btn-sunset inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                {locale === "bn"
                  ? "ফ্রি কাউন্সিলিং বুক করুন →"
                  : "Book Free Consultation →"}
              </Link>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-slate-800 shadow-xs transition-all hover:border-orange-300 hover:bg-white hover:text-orange-600"
              >
                <MessageCircle
                  className="size-4 text-emerald-600"
                  aria-hidden="true"
                />
                <span>
                  {locale === "bn"
                    ? "হোয়াটসঅ্যাপ পরামর্শ"
                    : "WhatsApp Consultation"}
                </span>
              </a>
            </motion.div>

            {/* Social Proof & Rating Bar (Single clean line) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-1 font-black text-slate-900">
                  {locale === "bn" ? "৪.৯/৫" : "4.9/5"}
                </span>
              </div>
              <span className="text-slate-300">·</span>
              <span className="font-bold text-slate-800">
                {locale === "bn"
                  ? "২৫০+ শিক্ষার্থী ও পরিবারের আস্থা"
                  : "250+ Students Guided"}
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                {locale === "bn"
                  ? "১০০% স্বচ্ছ গাইডেন্স"
                  : "100% Transparent Process"}
              </span>
            </motion.div>
          </div>

          {/* Bottom Horizon: 3D Earth Globe Arching up from Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.1,
              delay: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative mx-auto -mb-4 w-full max-w-6xl select-none"
          >
            <HeroGlobe />
          </motion.div>

          {/* Features / Why Choose Us Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-6 mb-10 w-full sm:mt-8 sm:mb-12"
          >
            <HeroFeaturesBar dict={dict} />
          </motion.div>
        </PageShell>
      </section>

      {/* 7-Step Journey Roadmap Section */}
      <JourneyRoadmap locale={locale} dict={dict} />

      {/* Destinations Section */}
      <section className="bg-[var(--brand-sky)] py-16 sm:py-24">
        <PageShell>
          <SectionHeading
            eyebrow={dict.home.destinationsEyebrow}
            title={dict.home.destinationsTitle}
            lede={dict.home.destinationsLede}
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
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

      {/* Testimonials Section */}
      <section className="border-t border-[var(--border)] bg-white py-16 sm:py-24">
        <PageShell>
          <SectionHeading
            eyebrow={dict.home.testimonialsEyebrow}
            title={dict.home.testimonialsTitle}
          />
          {stories.length > 0 ? (
            <FeaturedSuccessStories
              stories={stories}
              initialOffset={storiesOffset}
              locale={locale}
              dict={dict}
            />
          ) : (
            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {dict.home.testimonials.map((item) => (
                <li
                  key={item.role}
                  className="glass-panel rounded-3xl p-8 transition-all hover:shadow-[0_16px_36px_rgba(11,30,54,0.08)]"
                >
                  <blockquote>
                    <p className="text-base leading-8 font-medium text-[var(--brand-ink)]/90 italic">
                      “{item.quote}”
                    </p>
                    <footer className="mt-6 flex items-center gap-3 border-t border-[var(--border)]/60 pt-4">
                      <div className="font-display flex size-10 items-center justify-center rounded-full bg-[var(--brand-sky)] text-sm font-bold text-[var(--brand-navy)] shadow-xs">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--brand-navy)]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {item.role}
                        </p>
                      </div>
                    </footer>
                  </blockquote>
                </li>
              ))}
            </ul>
          )}
        </PageShell>
      </section>

      {/* High-Impact Lead Capture CTA */}
      <section
        id="lead"
        className="relative overflow-hidden bg-[#070e1c] py-20 text-white sm:py-28"
      >
        {/* Glow auroras & micro-grid */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-[32rem] rounded-full bg-gradient-to-br from-orange-500/20 via-rose-500/10 to-transparent blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 size-[32rem] rounded-full bg-gradient-to-tr from-cyan-500/15 via-teal-500/10 to-transparent blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-60"
          aria-hidden="true"
        />

        <PageShell>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
            {/* Left Column: Compelling Value Proposition & Trust Proofs */}
            <div>
              {/* Live Intake Beacon */}
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-300 shadow-2xs backdrop-blur-md">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-orange-500" />
                </span>
                <span className="font-utility tracking-wider uppercase">
                  {dict.home.leadEyebrow}
                </span>
              </div>

              {/* Editorial Headline */}
              <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.12]">
                {locale === "bn" ? (
                  <>
                    আজই নিন বিনামূল্যে প্রোফাইল মূল্যায়ন ও{" "}
                    <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
                      ভিসা রোডম্যাপ
                    </span>
                  </>
                ) : (
                  <>
                    Get a Free Profile Assessment &{" "}
                    <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
                      Visa Roadmap
                    </span>{" "}
                    Today
                  </>
                )}
              </h2>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {dict.home.leadBody}
              </p>

              {/* 3 Core Benefit Cards */}
              <div className="mt-8 max-w-xl space-y-3.5">
                {/* 1. University Shortlist */}
                <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07]">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-300">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {locale === "bn"
                        ? "সরাসরি বিশ্ববিদ্যালয় শর্টলিস্ট"
                        : "Tailored University Shortlist"}
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      {locale === "bn"
                        ? "আপনার জিপিএ, পছন্দের বিষয় ও পারিবারিক বাজেটের সঠিক বিশ্লেষণ।"
                        : "Accurate matching across China, India, Malaysia & South Korea based on your GPA and budget."}
                    </p>
                  </div>
                </div>

                {/* 2. Scholarship Audit */}
                <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07]">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-300">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {locale === "bn"
                        ? "স্কলারশিপ ও টিউশন ওয়েভার অডিট"
                        : "Scholarship & Merit Waiver Audit"}
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      {locale === "bn"
                        ? "সরকারি (CSC, GKS, SII) ও বিশ্ববিদ্যালয়ের নিজস্ব স্কলারশিপ সম্ভাবনা যাচাই।"
                        : "Real evaluation for government grants (CSC, GKS, SII) and institutional fee waivers."}
                    </p>
                  </div>
                </div>

                {/* 3. Rapid WhatsApp Delivery */}
                <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07]">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300">
                    <MessageCircle className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {locale === "bn"
                        ? "হোয়াটসঅ্যাপে সরাসরি ডেলিভারি (< ২ ঘণ্টা)"
                        : "Direct WhatsApp Delivery in < 2 Hours"}
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      {locale === "bn"
                        ? "কোনো রোবট বা জেনেরিক পিডিএফ নয় — ঢাকার সিনিয়র কাউন্সেলর ব্যক্তিগতভাবে পর্যালোচনা করবেন।"
                        : "No automated bots or generic brochures. A dedicated Dhaka counselor reviews every submission personally."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Proof & Alternative Action Strip */}
              <div className="mt-8 max-w-xl border-t border-white/10 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 overflow-hidden">
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 text-xs font-bold text-white ring-2 ring-[#070e1c]">
                        AR
                      </span>
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 text-xs font-bold text-white ring-2 ring-[#070e1c]">
                        TS
                      </span>
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-xs font-bold text-white ring-2 ring-[#070e1c]">
                        MH
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">
                          4.9/5 Rating
                        </span>
                        <span className="text-[0.7rem] text-slate-400">
                          · 250+ Families
                        </span>
                      </div>
                      <p className="text-[0.68rem] font-medium text-emerald-400">
                        Senior Counseling Desk, Dhaka
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href={localizedHref("/eligibility-quiz", locale)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                    >
                      <span>{dict.home.leadQuiz}</span>
                    </Link>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                    >
                      <MessageCircle className="size-3.5 text-emerald-400" />
                      <span>{dict.home.leadWhatsapp}</span>
                      <ArrowRight className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Masterclass Lead Form Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white p-6 text-slate-900 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6),0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl sm:p-9">
              {/* Top sunset accent stripe */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-400" />

              {/* Form Card Header */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
                    {locale === "bn"
                      ? "বিনামূল্যে মূল্যায়ন ফরম"
                      : "Start Your Free Evaluation"}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {locale === "bn"
                      ? "১ মিনিটে পূরণ করুন · সম্পূর্ণ তথ্য গোপনীয়"
                      : "Takes ~60 seconds · Confidential & 100% Free"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-bold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {locale === "bn" ? "কাউন্সেলর অনলাইন" : "Counselors Active"}
                </span>
              </div>

              <LeadForm copy={dict.leadForm} source="home-cta" />
            </div>
          </div>
        </PageShell>
      </section>

      {/* Events Section */}
      <section id="events" className="bg-slate-50 py-16 sm:py-24">
        <PageShell>
          <SectionHeading
            eyebrow={dict.home.eventsEyebrow}
            title={dict.home.eventsTitle}
          />
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {dict.home.events.map((event) => (
              <li
                key={event.title}
                className="glass-panel-interactive rounded-3xl border border-stone-200 p-7"
              >
                <span className="font-utility inline-block rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[0.68rem] font-bold text-orange-700 uppercase">
                  {event.mode}
                </span>
                <h3 className="font-heading mt-4 text-xl font-bold tracking-tight text-slate-900">
                  {event.title}
                </h3>
                <p className="mt-3 text-sm font-bold text-emerald-700">
                  📅 {event.date}
                </p>
              </li>
            ))}
          </ul>
        </PageShell>
      </section>
    </>
  );
}
