"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Compass,
  GraduationCap,
  FileText,
  Send,
  Landmark,
  ShieldCheck,
  PlaneTakeoff,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plane,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

interface JourneyRoadmapProps {
  locale: Locale;
  dict: Dictionary;
}

const STEP_CONFIGS = [
  {
    icon: Compass,
    tintClass: "marketing-glass-card",
    iconBoxClass: "bg-slate-100 text-slate-700 border-transparent",
    pillClass: "bg-transparent text-slate-500 border-transparent",
    dotColor: "#16704f",
  },
  {
    icon: GraduationCap,
    tintClass: "marketing-glass-card",
    iconBoxClass: "bg-slate-100 text-slate-700 border-transparent",
    pillClass: "bg-transparent text-slate-500 border-transparent",
    dotColor: "#16704f",
  },
  {
    icon: FileText,
    tintClass: "marketing-glass-card",
    iconBoxClass: "bg-slate-100 text-slate-700 border-transparent",
    pillClass: "bg-transparent text-slate-500 border-transparent",
    dotColor: "#16704f",
  },
  {
    icon: Send,
    tintClass: "marketing-glass-card",
    iconBoxClass: "bg-slate-100 text-slate-700 border-transparent",
    pillClass: "bg-transparent text-slate-500 border-transparent",
    dotColor: "#16704f",
  },
  {
    icon: Landmark,
    tintClass: "marketing-glass-card",
    iconBoxClass: "bg-slate-100 text-slate-700 border-transparent",
    pillClass: "bg-transparent text-slate-500 border-transparent",
    dotColor: "#16704f",
  },
  {
    icon: ShieldCheck,
    tintClass: "marketing-glass-card",
    iconBoxClass: "bg-slate-100 text-slate-700 border-transparent",
    pillClass: "bg-transparent text-slate-500 border-transparent",
    dotColor: "#16704f",
  },
  {
    icon: PlaneTakeoff,
    tintClass: "marketing-glass-card",
    iconBoxClass: "bg-slate-100 text-slate-700 border-transparent",
    pillClass: "bg-transparent text-slate-500 border-transparent",
    dotColor: "#16704f",
  },
];

const DEFAULT_STEP_CONFIG = STEP_CONFIGS[0]!;

export function JourneyRoadmap({ locale, dict }: JourneyRoadmapProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const steps = dict.home.journeySteps;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#f8f9fa] py-20 sm:py-28">
      {/* Soft Ambient Glows */}

      <PageShell className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionHeading
              eyebrow={dict.home.journeyEyebrow}
              title={
                locale === "bn" ? (
                  <>
                    বাংলাদেশ থেকে{" "}
                    <span className="text-[var(--brand-blue)]">
                      স্বপ্নের ক্যাম্পাসে
                    </span>
                  </>
                ) : (
                  <>
                    From Bangladesh to{" "}
                    <span className="text-[var(--brand-blue)]">
                      Your Dream Campus
                    </span>
                  </>
                )
              }
              lede={dict.home.journeyLede}
            />
          </div>

          {/* Desktop Navigation Scroll Controls */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={scrollLeft}
              className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* 
          ======================================================================
          1. DESKTOP VIEW: HORIZONTAL SCROLLABLE FLIGHT-PATH STRIP (lg+)
          ======================================================================
        */}
        <div className="relative mt-14 hidden lg:block">
          {/* Subtle Connecting Flight-Path Route Line behind cards */}
          <div
            className="pointer-events-none absolute top-20 right-10 left-10 z-0 h-0.5 border-t-2 border-dashed border-slate-300"
            aria-hidden="true"
          />

          {/* Scrollable Track Container */}
          <div
            ref={scrollContainerRef}
            className="no-scrollbar relative z-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pt-2 pb-6"
          >
            {steps.map((item, idx) => {
              const cfg =
                STEP_CONFIGS[idx % STEP_CONFIGS.length] ?? DEFAULT_STEP_CONFIG;
              const IconComponent = cfg.icon;

              return (
                <div key={item.step} className="w-[305px] shrink-0 snap-start">
                  <article
                    className={cn(
                      "group relative flex h-full flex-col justify-between rounded-2xl border p-6.5 shadow-2xs backdrop-blur-md transition-all duration-300",
                      "hover:-translate-y-1 hover:shadow-md",
                      cfg.tintClass,
                    )}
                  >
                    {/* Top Flight Waypoint Dot & Connection Accent */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Step Number Badge */}
                      <span
                        className={cn(
                          "font-utility inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-widest uppercase shadow-2xs",
                          cfg.pillClass,
                        )}
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: cfg.dotColor }}
                        />
                        STEP {item.step}
                      </span>

                      {/* Tag pill */}
                      <span className="font-utility text-[0.68rem] font-bold tracking-wider text-slate-500 uppercase">
                        {item.tag}
                      </span>
                    </div>

                    {/* Step Icon with Micro Bounce Interaction */}
                    <div className="mt-6 flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-14 items-center justify-center rounded-2xl border shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
                          cfg.iconBoxClass,
                        )}
                      >
                        <IconComponent
                          className="size-6.5"
                          aria-hidden="true"
                        />
                      </div>
                      {idx < steps.length - 1 && (
                        <div className="flex items-center text-slate-300 opacity-60">
                          <span className="text-xs">┈┈┈</span>
                          <Plane className="size-3.5 rotate-90 text-orange-400 opacity-70" />
                        </div>
                      )}
                    </div>

                    {/* Title & Body */}
                    <div className="mt-5">
                      <h3 className="font-heading text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-orange-600">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 text-[0.88rem] leading-relaxed font-medium text-slate-600">
                        {item.body}
                      </p>
                    </div>

                    {/* Subtle Card Footer Indicator */}
                    <div className="mt-6 flex items-center gap-1 border-t border-slate-200/60 pt-3 text-[0.7rem] font-bold text-slate-400">
                      <span>Phase {idx + 1} of 7</span>
                    </div>
                  </article>
                </div>
              );
            })}

            {/* Finale Step: CTA Card to End the Strip */}
            <div className="w-[340px] shrink-0 snap-start">
              <aside className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-orange-300/80 bg-[var(--brand-blue)] p-7 text-white shadow-xl">
                {/* Background Ambient Star */}
                <div
                  className="pointer-events-none absolute -top-8 -right-8 size-36 rounded-full bg-white/10 blur-xl"
                  aria-hidden="true"
                />

                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-mono text-xs font-bold text-white backdrop-blur-md">
                    <Sparkles className="size-3.5 text-amber-200" />
                    <span>READY FOR TAKEOFF</span>
                  </div>

                  <h3 className="font-heading mt-6 text-2xl leading-tight font-semibold tracking-tight text-white">
                    {locale === "bn"
                      ? "আপনার প্রথম পদক্ষেপটি আজই নিন"
                      : "Ready to Take Your First Step?"}
                  </h3>

                  <p className="mt-3 text-[0.92rem] leading-relaxed font-normal text-white/90">
                    {locale === "bn"
                      ? "অভিভাবকসহ আমাদের সাথে ফ্রি কাউন্সেলিং বুক করুন। সম্পূর্ণ রোডম্যাপ হাতে নিয়ে প্রস্তুতি শুরু করুন।"
                      : "Book a complimentary session with our senior counselor. Get a personalized roadmap tailored to your profile & budget."}
                  </p>
                </div>

                <div className="mt-8">
                  <Link
                    href={localizedHref("/contact", locale)}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-center text-sm font-semibold text-orange-600 shadow-md transition-all hover:bg-orange-50"
                  >
                    <span>{dict.home.journeyCta}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* 
          ======================================================================
          2. MOBILE VIEW: VERTICAL STACKED TIMELINE (< lg)
          ======================================================================
        */}
        <div className="relative mt-12 block lg:hidden">
          {/* Vertical Illuminated Flight-Path Spine */}
          <div
            className="absolute top-4 bottom-24 left-6 z-0 w-0.5 bg-[#f8f9fa]"
            aria-hidden="true"
          />

          <ol className="relative z-10 space-y-6">
            {steps.map((item, idx) => {
              const cfg =
                STEP_CONFIGS[idx % STEP_CONFIGS.length] ?? DEFAULT_STEP_CONFIG;
              const IconComponent = cfg.icon;

              return (
                <li
                  key={item.step}
                  className="relative flex items-start gap-4 pl-2"
                >
                  {/* Waypoint Icon on the Spine */}
                  <div
                    className={cn(
                      "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-md",
                      cfg.iconBoxClass,
                    )}
                    style={{ backgroundColor: cfg.dotColor, color: "#ffffff" }}
                  >
                    <IconComponent className="size-4.5" aria-hidden="true" />
                  </div>

                  {/* Step Card */}
                  <article
                    className={cn(
                      "group flex-1 rounded-2xl border p-5 shadow-2xs backdrop-blur-md transition-all duration-300 active:scale-[0.99]",
                      cfg.tintClass,
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "font-utility rounded-full border px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wider uppercase",
                          cfg.pillClass,
                        )}
                      >
                        STEP {item.step}
                      </span>
                      <span className="font-utility text-[0.65rem] font-bold text-slate-500 uppercase">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="font-heading mt-3 text-base font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {item.body}
                    </p>
                  </article>
                </li>
              );
            })}

            {/* Mobile Finale CTA Card */}
            <li className="relative pt-4 pl-2">
              <div className="overflow-hidden rounded-2xl bg-[var(--brand-blue)] p-6 text-white shadow-lg">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-[0.68rem] font-bold text-white">
                  <Sparkles className="size-3" />
                  <span>START TODAY</span>
                </span>
                <h3 className="font-heading mt-3 text-xl font-semibold text-white">
                  {locale === "bn"
                    ? "আপনার প্রথম পদক্ষেপটি আজই নিন"
                    : "Ready to Start Your Journey?"}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/90">
                  {locale === "bn"
                    ? "অভিভাবকসহ আমাদের সাথে ফ্রি কাউন্সেলিং বুক করুন।"
                    : "Free 1-on-1 consultation with parents in the room."}
                </p>
                <div className="mt-5">
                  <Link
                    href={localizedHref("/contact", locale)}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-center text-xs font-semibold text-orange-600 shadow-md transition-transform active:scale-98"
                  >
                    <span>{dict.home.journeyCta}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </PageShell>
    </section>
  );
}
