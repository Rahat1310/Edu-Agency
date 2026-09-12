import Link from "next/link";

import type { DestinationMeta } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import {
  CountryFlagBadge,
  CountryWatermark,
} from "@/components/marketing/destination-watermarks";

type DestinationCardProps = {
  destination: DestinationMeta;
  locale: Locale;
  dict: Dictionary;
};

const DEST_THEMES: Record<
  string,
  {
    cardClass: string;
    pillClass: string;
    dotColor: string;
    accentGradient: string;
    hoverText: string;
    nativeName: string;
    visaBadgeClass: string;
    btnHover: string;
    hoverBorder: string;
  }
> = {
  china: {
    cardClass: "card-color-rose",
    pillClass: "bg-rose-50/90 text-rose-950 border-rose-200/90 shadow-rose-500/5",
    dotColor: "#f43f5e",
    accentGradient: "from-rose-500 via-rose-400 to-amber-400",
    hoverText: "group-hover:text-rose-600",
    nativeName: "中国",
    visaBadgeClass: "border-rose-200/80 bg-rose-50/90 text-rose-700",
    btnHover: "hover:border-rose-300 hover:text-rose-600 hover:shadow-rose-500/10",
    hoverBorder: "hover:border-rose-300/80",
  },
  malaysia: {
    cardClass: "card-color-sky",
    pillClass: "bg-sky-50/90 text-sky-950 border-sky-200/90 shadow-sky-500/5",
    dotColor: "#0284c7",
    accentGradient: "from-sky-500 via-teal-400 to-cyan-300",
    hoverText: "group-hover:text-sky-600",
    nativeName: "Malaysia",
    visaBadgeClass: "border-sky-200/80 bg-sky-50/90 text-sky-800",
    btnHover: "hover:border-sky-300 hover:text-sky-600 hover:shadow-sky-500/10",
    hoverBorder: "hover:border-sky-300/80",
  },
  "south-korea": {
    cardClass: "card-color-purple",
    pillClass: "bg-purple-50/90 text-purple-950 border-purple-200/90 shadow-purple-500/5",
    dotColor: "#9333ea",
    accentGradient: "from-purple-600 via-indigo-500 to-sky-400",
    hoverText: "group-hover:text-purple-600",
    nativeName: "대한민국",
    visaBadgeClass: "border-purple-200/80 bg-purple-50/90 text-purple-800",
    btnHover: "hover:border-purple-300 hover:text-purple-600 hover:shadow-purple-500/10",
    hoverBorder: "hover:border-purple-300/80",
  },
  india: {
    cardClass: "card-color-amber",
    pillClass: "bg-amber-50/90 text-amber-950 border-amber-200/90 shadow-amber-500/5",
    dotColor: "#d97706",
    accentGradient: "from-amber-500 via-orange-400 to-amber-300",
    hoverText: "group-hover:text-amber-600",
    nativeName: "भारत",
    visaBadgeClass: "border-amber-200/80 bg-amber-50/90 text-amber-800",
    btnHover: "hover:border-amber-300 hover:text-amber-600 hover:shadow-amber-500/10",
    hoverBorder: "hover:border-amber-300/80",
  },
};

export function DestinationCard({
  destination,
  locale,
  dict,
}: DestinationCardProps) {
  const copy = dict.destinations[destination.slug];
  const href = localizedHref(`/destinations/${destination.slug}`, locale);
  const theme = DEST_THEMES[destination.slug] ?? {
    cardClass: "card-color-sky",
    pillClass: "bg-sky-50/90 text-sky-950 border-sky-200/90 shadow-sky-500/5",
    dotColor: destination.color,
    accentGradient: "from-sky-500 via-teal-400 to-cyan-300",
    hoverText: "group-hover:text-sky-600",
    nativeName: destination.code,
    visaBadgeClass: "border-sky-200/80 bg-sky-50/90 text-sky-800",
    btnHover: "hover:border-sky-300 hover:text-sky-600 hover:shadow-sky-500/10",
    hoverBorder: "hover:border-sky-300/80",
  };

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-[2.25rem] p-7 sm:p-8 transition-all duration-500",
        "border shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)] backdrop-blur-xl",
        "hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.14)]",
        theme.cardClass,
        theme.hoverBorder,
      )}
    >
      {/* Top Radiant Accent Hairline */}
      <div
        className={cn(
          "absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r opacity-95 transition-all duration-500 group-hover:h-[4px]",
          theme.accentGradient,
        )}
      />

      {/* Bespoke Country Flag & Map Watermark (Behind Content) */}
      <CountryWatermark slug={destination.slug} />

      {/* Main Content (Elevated above watermark) */}
      <div className="relative z-10">
        {/* Header Badge */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <span
            className={cn(
              "font-utility inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[0.72rem] font-bold tracking-wider uppercase shadow-xs backdrop-blur-md transition-transform duration-300 group-hover:scale-[1.02]",
              theme.pillClass,
            )}
          >
            <CountryFlagBadge slug={destination.slug} className="h-3.5 w-5" />
            <span className="font-extrabold text-slate-900">{destination.code}</span>
            <span className="text-slate-400">·</span>
            <span className="text-[0.68rem] font-semibold tracking-normal text-slate-700">
              {theme.nativeName}
            </span>
          </span>
        </div>

        {/* Destination Name */}
        <h3
          className={cn(
            "font-display mt-5 text-[1.85rem] leading-tight font-black tracking-tight text-slate-900 transition-colors duration-300",
            theme.hoverText,
          )}
        >
          {copy.name}
        </h3>

        {/* Tagline */}
        <p className="mt-3.5 text-[1.02rem] leading-relaxed font-medium text-slate-600">
          {copy.tagline}
        </p>

        {/* Official Visa Credential Panel */}
        <div className="mt-7 rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-300 group-hover:border-slate-300/90 group-hover:bg-white/95 group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ backgroundColor: theme.dotColor }}
                />
                <span
                  className="relative inline-flex size-2 rounded-full"
                  style={{ backgroundColor: theme.dotColor }}
                />
              </span>
              <span className="font-utility text-[0.68rem] font-bold tracking-wider text-slate-500 uppercase">
                {dict.destination.visaTitle}
              </span>
            </div>
            <span
              className={cn(
                "font-utility rounded-md border px-2 py-0.5 text-[0.66rem] font-bold tracking-wide uppercase",
                theme.visaBadgeClass,
              )}
            >
              Verified Route
            </span>
          </div>

          <p className="mt-2 text-[1.05rem] font-extrabold tracking-tight text-slate-900">
            {destination.visaLabel}
          </p>

          {copy.visaExplanation ? (
            <p className="mt-2 text-[0.84rem] leading-relaxed font-medium text-slate-600">
              {copy.visaExplanation}
            </p>
          ) : null}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="relative z-10 mt-7 border-t border-slate-200/70 pt-5">
        <Link
          href={href}
          className={cn(
            "btn-secondary-glass focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 text-[0.92rem] font-bold text-slate-800 transition-all duration-300 hover:bg-white",
            theme.btnHover,
          )}
        >
          <span>{dict.common.viewDestination}</span>
          <span className="font-utility text-lg transition-transform duration-300 group-hover:translate-x-1.5">
            →
          </span>
          <span className="sr-only">: {copy.name}</span>
        </Link>
      </div>
    </article>
  );
}

