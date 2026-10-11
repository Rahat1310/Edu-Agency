"use client";

import { GraduationCap, ShieldCheck, Award, FileCheck2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

interface HeroFeaturesBarProps {
  dict: Dictionary;
  className?: string;
}

const FEATURE_ICONS = [GraduationCap, ShieldCheck, Award, FileCheck2];

export function HeroFeaturesBar({ dict, className }: HeroFeaturesBarProps) {
  const features = dict.home.featuresBar;

  return (
    <div className={cn("relative z-20 mx-auto w-full max-w-6xl", className)}>
      <div className="grid grid-cols-1 gap-6 border-t border-slate-200/70 pt-7 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((item, idx) => {
          const Icon = FEATURE_ICONS[idx] ?? GraduationCap;

          return (
            <div
              key={item.title}
              className="marketing-glass-card group relative flex items-center gap-3.5 rounded-xl p-4"
            >
              {/* Soft Rounded Icon Container */}
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f6f8] text-slate-700 transition-all duration-300 group-hover:scale-105 group-hover:bg-orange-50 group-hover:text-orange-600">
                <Icon className="size-5 stroke-[1.8]" aria-hidden="true" />
              </div>

              {/* Text Information */}
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-[0.82rem] font-semibold tracking-wider text-slate-900 transition-colors duration-300 group-hover:text-orange-600">
                  {item.title}
                </h3>
                <p className="text-[0.74rem] font-medium text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
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
