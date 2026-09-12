"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Locale } from "@/lib/i18n/config";

interface StudentMilestone {
  name: string;
  from: string;
  university: string;
  country: string;
  flag: string;
  achievement: string;
  program: string;
  badgeColor: string;
}

const MILESTONES: StudentMilestone[] = [
  {
    name: "Fahim S.",
    from: "Dhaka",
    university: "Zhejiang University",
    country: "China",
    flag: "🇨🇳",
    achievement: "100% CSC Full Scholarship",
    program: "B.Sc Computer Science & AI",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    name: "Sumaiya R.",
    from: "Chittagong",
    university: "Monash University Malaysia",
    country: "Malaysia",
    flag: "🇲🇾",
    achievement: "Visa Approved in 11 Days",
    program: "B.Eng Software Engineering",
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    name: "Tanvir H.",
    from: "Dhaka",
    university: "Seoul National University",
    country: "South Korea",
    flag: "🇰🇷",
    achievement: "GKS Government Scholarship",
    program: "M.Sc Robotics & Automation",
    badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    name: "Abrar K.",
    from: "Sylhet",
    university: "VIT Vellore",
    country: "India",
    flag: "🇮🇳",
    achievement: "75% Merit Tuition Waiver",
    program: "B.Tech Information Technology",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    name: "Nusrat J.",
    from: "Dhaka",
    university: "IU International Univ",
    country: "Germany / EU",
    flag: "🇩🇪",
    achievement: "Visa Granted + 50% Waiver",
    program: "M.Sc Data Science",
    badgeColor: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
  {
    name: "Mahir A.",
    from: "Rajshahi",
    university: "Harbin Institute of Tech",
    country: "China",
    flag: "🇨🇳",
    achievement: "Presidential Full Waiver",
    program: "Mechanical Engineering",
    badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
];

export function HeroLiveTicker({ locale = "en" }: { locale?: Locale }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MILESTONES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const current = MILESTONES[index];
  if (!current) return null;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="mt-5 w-full max-w-xl"
    >
      <Link
        href={locale === "bn" ? "/bn/success-stories" : "/success-stories"}
        className="group relative block overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 p-3.5 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-orange-300 hover:shadow-md sm:px-5 sm:py-3.5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Header indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[0.68rem] font-black tracking-wider text-emerald-700 uppercase">
              {locale === "bn"
                ? "লাইভ ভিসা ও স্কলারশিপ অনুমোদন"
                : "LIVE STUDENT APPROVAL"}
            </span>
            <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 font-mono text-[0.62rem] font-bold text-slate-600">
              {index + 1}/{MILESTONES.length}
            </span>
          </div>

          <span className="hidden items-center gap-1 font-mono text-[0.68rem] font-semibold text-slate-500 transition-colors group-hover:text-orange-600 sm:inline-flex">
            {locale === "bn" ? "সব গল্প দেখুন" : "View all stories"} →
          </span>
        </div>

        {/* Animated Milestone Card */}
        <div className="relative mt-2.5 h-11 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-base shadow-2xs">
                  {current.flag}
                </div>
                <div className="min-w-0 truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-display truncate text-xs font-bold text-slate-900 sm:text-[0.85rem]">
                      {current.name}
                    </span>
                    <span className="font-mono text-[0.68rem] text-slate-500">
                      ({current.from})
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="truncate text-xs font-semibold text-slate-700">
                      {current.university}
                    </span>
                  </div>
                  <p className="truncate text-[0.72rem] text-slate-500">
                    {current.program}
                  </p>
                </div>
              </div>

              {/* Achievement Pill */}
              <div className="font-display shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[0.68rem] font-bold whitespace-nowrap text-orange-700 shadow-2xs">
                {current.achievement}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Link>
    </div>
  );
}
