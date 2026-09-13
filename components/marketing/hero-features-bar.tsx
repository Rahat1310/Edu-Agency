"use client";

import {
  GraduationCap,
  ShieldCheck,
  Award,
  FileCheck2,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

interface HeroFeaturesBarProps {
  dict: Dictionary;
  className?: string;
}

const FEATURE_ICONS = [
  GraduationCap,
  ShieldCheck,
  Award,
  FileCheck2,
];

export function HeroFeaturesBar({
  dict,
  className,
}: HeroFeaturesBarProps) {
  const features = dict.home.featuresBar;

  return (
    <div
      className={cn(
        "relative z-20 mx-auto w-full max-w-6xl",
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((item, idx) => {
          const Icon = FEATURE_ICONS[idx] ?? GraduationCap;

          return (
            <div
              key={item.title}
              className="group relative flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_10px_25px_rgba(234,88,12,0.08)]"
            >
              {/* Soft Rounded Icon Container */}
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f8] text-slate-700 transition-all duration-300 group-hover:scale-105 group-hover:bg-orange-50 group-hover:text-orange-600">
                <Icon className="size-5 stroke-[1.8]" aria-hidden="true" />
              </div>

              {/* Text Information */}
              <div className="min-w-0 flex-1">
                <h3 className="font-display truncate text-[0.82rem] font-extrabold tracking-wider text-slate-900 uppercase transition-colors duration-300 group-hover:text-orange-600">
                  {item.title}
                </h3>
                <p className="line-clamp-1 text-[0.74rem] font-medium text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
