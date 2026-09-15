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
    tintClass: "bg-amber-50/80 border-amber-200/80 hover:border-amber-300",
    iconBoxClass: "bg-amber-100/90 text-amber-700 border-amber-200",
    pillClass: "bg-amber-100/70 text-amber-900 border-amber-200",
    dotColor: "#f59e0b",
  },
  {
    icon: GraduationCap,
    tintClass: "bg-rose-50/80 border-rose-200/80 hover:border-rose-300",
    iconBoxClass: "bg-rose-100/90 text-rose-700 border-rose-200",
    pillClass: "bg-rose-100/70 text-rose-900 border-rose-200",
    dotColor: "#f43f5e",
  },
  {
    icon: FileText,
    tintClass: "bg-sky-50/80 border-sky-200/80 hover:border-sky-300",
    iconBoxClass: "bg-sky-100/90 text-sky-700 border-sky-200",
    pillClass: "bg-sky-100/70 text-sky-900 border-sky-200",
    dotColor: "#0284c7",
  },
  {
    icon: Send,
    tintClass:
      "bg-emerald-50/80 border-emerald-200/80 hover:border-emerald-300",
    iconBoxClass: "bg-emerald-100/90 text-emerald-700 border-emerald-200",
    pillClass: "bg-emerald-100/70 text-emerald-900 border-emerald-200",
    dotColor: "#10b981",
  },
  {
    icon: Landmark,
    tintClass: "bg-purple-50/80 border-purple-200/80 hover:border-purple-300",
    iconBoxClass: "bg-purple-100/90 text-purple-700 border-purple-200",
    pillClass: "bg-purple-100/70 text-purple-900 border-purple-200",
    dotColor: "#9333ea",
  },
  {
    icon: ShieldCheck,
    tintClass: "bg-orange-50/80 border-orange-200/80 hover:border-orange-300",
    iconBoxClass: "bg-orange-100/90 text-orange-700 border-orange-200",
    pillClass: "bg-orange-100/70 text-orange-900 border-orange-200",
    dotColor: "#ea580c",
  },
  {
    icon: PlaneTakeoff,
    tintClass: "bg-teal-50/80 border-teal-200/80 hover:border-teal-300",
    iconBoxClass: "bg-teal-100/90 text-teal-700 border-teal-200",
    pillClass: "bg-teal-100/70 text-teal-900 border-teal-200",
    dotColor: "#0d9488",
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
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white py-20 sm:py-28">
      {/* Soft Ambient Glows */}
      <div
        className="pointer-events-none absolute top-1/4 -left-48 size-96 rounded-full bg-orange-400/10 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-48 bottom-1/4 size-96 rounded-full bg-sky-400/10 blur-[130px]"
        aria-hidden="true"
      />

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
                    <span className="bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                      স্বপ্নের ক্যাম্পাসে
                    </span>
                  </>
                ) : (
                  <>
                    From Bangladesh to{" "}
                    <span className="bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
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
            className="pointer-events-none absolute top-20 right-10 left-10 z-0 h-0.5 border-t-2 border-dashed border-orange-300/60"
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
                      "group relative flex h-full flex-col justify-between rounded-[2rem] border p-6.5 shadow-2xs backdrop-blur-md transition-all duration-300",
                      "hover:-translate-y-2 hover:shadow-xl",
                      cfg.tintClass,
                    )}
                  >
                    {/* Top Flight Waypoint Dot & Connection Accent */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Step Number Badge */}
                      <span
                        className={cn(
                          "font-utility inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black tracking-widest uppercase shadow-2xs",
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
              <aside className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border border-orange-300/80 bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 p-7 text-white shadow-xl">
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

                  <h3 className="font-heading mt-6 text-2xl leading-tight font-black tracking-tight text-white">
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
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-center text-sm font-black text-orange-600 shadow-md transition-all hover:scale-[1.02] hover:bg-orange-50 active:scale-[0.98]"
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
            className="absolute top-4 bottom-24 left-6 z-0 w-0.5 bg-gradient-to-b from-orange-400 via-emerald-400 to-sky-400"
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
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 p-6 text-white shadow-lg">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-[0.68rem] font-bold text-white">
                  <Sparkles className="size-3" />
                  <span>START TODAY</span>
                </span>
                <h3 className="font-heading mt-3 text-xl font-black text-white">
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
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-center text-xs font-black text-orange-600 shadow-md transition-transform active:scale-98"
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
