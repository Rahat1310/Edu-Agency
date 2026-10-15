"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  Compass,
  FileText,
  GraduationCap,
  Landmark,
  Plane,
  PlaneTakeoff,
  School,
  Send,
  ShieldCheck,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const icons = [
  Compass,
  GraduationCap,
  FileText,
  Send,
  Landmark,
  ShieldCheck,
  PlaneTakeoff,
];
const iconAnimations = [
  { rotate: [0, -25, 15, 0] },
  { y: [0, -6, 0], rotate: [0, -8, 0] },
  { rotate: [0, -8, 0] },
  { x: [0, 7, 0], y: [0, -7, 0] },
  { y: [0, -4, 0] },
  { scale: [1, 1.18, 1] },
  { x: [0, 8, 0], y: [0, -8, 0] },
];

type JourneyStep = Dictionary["home"]["journeySteps"][number];

function Milestone({
  item,
  index,
  locale,
}: {
  item: JourneyStep;
  index: number;
  locale: Locale;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reached = useInView(ref, { margin: "0px 0px -25% 0px", once: true });
  const reducedMotion = useReducedMotion();
  const highlighted = reached || reducedMotion;
  const Icon = icons[index % icons.length] ?? Compass;

  return (
    <li
      ref={ref}
      className="relative grid gap-5 pb-10 pl-14 last:pb-0 sm:pl-20 lg:grid-cols-2 lg:gap-24 lg:pb-16 lg:pl-0"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-7 left-4 z-10 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#f8f9fa] transition-colors duration-500 motion-reduce:transition-none sm:left-6 lg:left-1/2",
          highlighted
            ? "bg-orange-500 ring-1 ring-orange-200"
            : "bg-slate-300 ring-1 ring-slate-200",
        )}
      >
        {highlighted && <Check className="size-3 text-white" />}
      </span>
      <motion.article
        initial={false}
        animate={{ y: reached || reducedMotion ? 0 : 12 }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
        className={cn(
          "relative rounded-2xl border bg-white p-5 shadow-sm transition-colors duration-500 motion-reduce:transition-none sm:p-7",
          index % 2 === 0 ? "lg:col-start-1" : "lg:col-start-2",
          highlighted ? "border-orange-200" : "border-slate-200",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-[38px] hidden h-px w-12 bg-orange-200 lg:block",
            index % 2 === 0 ? "-right-12" : "-left-12",
          )}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="font-utility text-xs font-bold tracking-[0.14em] text-orange-700 uppercase">
            {locale === "bn" ? "ধাপ" : "Step"} {item.step}
          </span>
          <span className="text-xs font-medium text-slate-500">{item.tag}</span>
        </div>
        <div className="mt-5 flex items-start gap-4">
          <motion.span
            aria-hidden="true"
            animate={
              reached && !reducedMotion
                ? iconAnimations[index % iconAnimations.length]
                : { rotate: 0, x: 0, y: 0, scale: 1 }
            }
            transition={{ duration: 0.8, delay: 0.15, ease: "easeInOut" }}
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              highlighted
                ? "bg-orange-50 text-orange-600"
                : "bg-slate-100 text-slate-500",
            )}
          >
            <Icon className="size-6" />
          </motion.span>
          <div>
            <h3 className="font-heading text-lg leading-snug font-bold text-slate-900 sm:text-xl">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
          </div>
        </div>
      </motion.article>
    </li>
  );
}

export function JourneyRoadmap({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 70%", "end 70%"],
  });
  const markerTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative overflow-hidden bg-[#f8f9fa] py-20 sm:py-28">
      <PageShell>
        <div className="max-w-2xl">
          <SectionHeading
            eyebrow={dict.home.journeyEyebrow}
            title={dict.home.journeyTitle}
            lede={dict.home.journeyLede}
          />
        </div>

        <div ref={trackRef} className="relative mt-12 sm:mt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-10 bottom-0 left-4 w-0.5 bg-slate-200 sm:left-6 lg:left-1/2"
          >
            <motion.div
              style={{ scaleY: reducedMotion ? 1 : scrollYProgress }}
              className="absolute inset-0 origin-top bg-orange-500"
            />
            {!reducedMotion && (
              <motion.span
                style={{ top: markerTop }}
                className="absolute left-1/2 z-20 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#f8f9fa] bg-orange-500 text-white shadow-sm"
              >
                <Plane className="size-4 rotate-[135deg]" />
              </motion.span>
            )}
          </div>
          <ol className="relative">
            {dict.home.journeySteps.map((item, index) => (
              <Milestone
                key={item.step}
                item={item}
                index={index}
                locale={locale}
              />
            ))}
          </ol>
        </div>

        <div className="relative mt-10 pl-14 sm:pl-20 lg:mt-14 lg:pl-0">
          <div className="rounded-3xl border border-orange-200 bg-white p-6 sm:p-10 lg:mx-auto lg:max-w-2xl lg:text-center">
            <div
              aria-hidden="true"
              className="relative mb-6 inline-flex items-end gap-1 border-b-2 border-orange-200 px-5 pt-3 text-slate-800"
            >
              <span className="h-8 w-5 rounded-t-sm bg-orange-100" />
              <School className="size-20 stroke-[1.2]" />
              <span className="h-8 w-5 rounded-t-sm bg-orange-100" />
              <span className="absolute -top-1 right-3 flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Check className="size-4" />
              </span>
            </div>
            <p className="font-utility text-xs font-bold tracking-[0.14em] text-orange-700 uppercase">
              {locale === "bn"
                ? "পরবর্তী গন্তব্য: ক্যাম্পাস"
                : "Next stop: campus"}
            </p>
            <h3 className="font-heading mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {locale === "bn"
                ? "ক্যাম্পাসের প্রথম দিনের প্রস্তুতি"
                : "Ready for your first day"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {locale === "bn"
                ? "পড়াশোনার পরিকল্পনা নিয়ে আমাদের কাউন্সেলরের সাথে কথা বলুন।"
                : "Start with a conversation about your study plans. We’ll help you work through each step."}
            </p>
            <Link
              href={localizedHref("/contact", locale)}
              className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            >
              {dict.home.journeyCta}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </PageShell>
    </section>
  );
}
