import React from "react";
import type { DestinationSlug } from "@/lib/destinations";

interface WatermarkProps {
  slug: DestinationSlug;
  className?: string;
}

/**
 * High-definition country micro-flags for the header pill badge
 */
export function CountryFlagBadge({
  slug,
  className = "w-5 h-3.5",
}: {
  slug: DestinationSlug;
  className?: string;
}) {
  switch (slug) {
    case "china":
      return (
        <svg
          viewBox="0 0 30 20"
          className={`shrink-0 overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.18)] ring-1 ring-black/10 ${className}`}
          aria-hidden="true"
        >
          <rect width="30" height="20" fill="#DE2910" />
          {/* Main Large Star */}
          <polygon
            points="5,2 6.18,5.62 9.99,5.62 6.9,7.86 8.09,11.48 5,9.24 1.91,11.48 3.1,7.86 0.01,5.62 3.82,5.62"
            fill="#FFDE00"
            transform="translate(0, 0) scale(0.65)"
          />
          {/* 4 Small Stars */}
          <g fill="#FFDE00" transform="scale(0.26)">
            {/* Star 1 */}
            <polygon
              points="38,8 41,17 50,17 43,22 45,31 38,26 31,31 33,22 26,17 35,17"
              transform="rotate(23 38 18)"
            />
            {/* Star 2 */}
            <polygon
              points="46,20 49,29 58,29 51,34 53,43 46,38 39,43 41,34 34,29 43,29"
              transform="rotate(45 46 30)"
            />
            {/* Star 3 */}
            <polygon
              points="46,38 49,47 58,47 51,52 53,61 46,56 39,61 41,52 34,47 43,47"
              transform="rotate(0 46 48)"
            />
            {/* Star 4 */}
            <polygon
              points="38,50 41,59 50,59 43,64 45,73 38,68 31,73 33,64 26,59 35,59"
              transform="rotate(-20 38 60)"
            />
          </g>
        </svg>
      );

    case "india":
      return (
        <svg
          viewBox="0 0 30 20"
          className={`shrink-0 overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.18)] ring-1 ring-black/10 ${className}`}
          aria-hidden="true"
        >
          {/* Saffron Top Band */}
          <rect width="30" height="6.67" fill="#FF9933" />
          {/* White Middle Band */}
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          {/* Green Bottom Band */}
          <rect y="13.33" width="30" height="6.67" fill="#138808" />
          {/* Ashoka Chakra */}
          <circle cx="15" cy="10" r="2.8" fill="none" stroke="#000080" strokeWidth="0.6" />
          <circle cx="15" cy="10" r="0.7" fill="#000080" />
          {/* 24 spokes */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="15"
              y1="7.4"
              x2="15"
              y2="12.6"
              stroke="#000080"
              strokeWidth="0.32"
              transform={`rotate(${i * 15} 15 10)`}
            />
          ))}
        </svg>
      );

    case "malaysia":
      return (
        <svg
          viewBox="0 0 30 20"
          className={`shrink-0 overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.18)] ring-1 ring-black/10 ${className}`}
          aria-hidden="true"
        >
          {/* 14 Stripes (alternating red and white) */}
          {Array.from({ length: 14 }).map((_, i) => (
            <rect
              key={i}
              y={i * (20 / 14)}
              width="30"
              height={20 / 14 + 0.1}
              fill={i % 2 === 0 ? "#CC0000" : "#FFFFFF"}
            />
          ))}
          {/* Blue Canton (top-left covering 8 stripes) */}
          <rect width="15" height={(20 / 14) * 8} fill="#000066" />
          {/* Yellow Crescent */}
          <circle cx="6.5" cy="5.7" r="3.6" fill="#FFCC00" />
          <circle cx="7.5" cy="5.7" r="3.2" fill="#000066" />
          {/* 14-pointed Star */}
          <g transform="translate(10.2, 5.7) scale(0.24)">
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1="-9"
                x2="0"
                y2="9"
                stroke="#FFCC00"
                strokeWidth="2.4"
                transform={`rotate(${i * (180 / 7)})`}
              />
            ))}
            <circle cx="0" cy="0" r="3.2" fill="#FFCC00" />
          </g>
        </svg>
      );

    case "south-korea":
      return (
        <svg
          viewBox="0 0 30 20"
          className={`shrink-0 overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.18)] ring-1 ring-black/10 ${className}`}
          aria-hidden="true"
        >
          {/* White Field */}
          <rect width="30" height="20" fill="#FFFFFF" />
          {/* Taegeuk Yin-Yang Circle in Center */}
          <g transform="translate(15, 10) rotate(-34)">
            <path d="M -4.5 0 A 4.5 4.5 0 0 1 4.5 0 A 2.25 2.25 0 0 1 0 0 A 2.25 2.25 0 0 0 -4.5 0 Z" fill="#C60C30" />
            <path d="M 4.5 0 A 4.5 4.5 0 0 1 -4.5 0 A 2.25 2.25 0 0 1 0 0 A 2.25 2.25 0 0 0 4.5 0 Z" fill="#003478" />
          </g>
          {/* 4 Trigrams (Black) */}
          {/* Geon (Top-Left): 3 unbroken lines */}
          <g transform="translate(7.5, 5) rotate(34) scale(0.4)" stroke="#000000" strokeWidth="1.2">
            <line x1="-5" y1="-3" x2="5" y2="-3" />
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="-5" y1="3" x2="5" y2="3" />
          </g>
          {/* Gon (Bottom-Right): 3 broken lines */}
          <g transform="translate(22.5, 15) rotate(34) scale(0.4)" stroke="#000000" strokeWidth="1.2">
            <line x1="-5" y1="-3" x2="-1" y2="-3" />
            <line x1="1" y1="-3" x2="5" y2="-3" />
            <line x1="-5" y1="0" x2="-1" y2="0" />
            <line x1="1" y1="0" x2="5" y2="0" />
            <line x1="-5" y1="3" x2="-1" y2="3" />
            <line x1="1" y1="3" x2="5" y2="3" />
          </g>
          {/* Gam (Top-Right): broken, unbroken, broken */}
          <g transform="translate(22.5, 5) rotate(-34) scale(0.4)" stroke="#000000" strokeWidth="1.2">
            <line x1="-5" y1="-3" x2="-1" y2="-3" />
            <line x1="1" y1="-3" x2="5" y2="-3" />
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="-5" y1="3" x2="5" y2="3" />
            <line x1="1" y1="3" x2="5" y2="3" />
          </g>
          {/* Ri (Bottom-Left): unbroken, broken, unbroken */}
          <g transform="translate(7.5, 15) rotate(-34) scale(0.4)" stroke="#000000" strokeWidth="1.2">
            <line x1="-5" y1="-3" x2="5" y2="-3" />
            <line x1="-5" y1="0" x2="-1" y2="0" />
            <line x1="1" y1="0" x2="5" y2="0" />
            <line x1="-5" y1="3" x2="5" y2="3" />
          </g>
        </svg>
      );
  }
}

/**
 * Authentic Layered Map Silhouette + Flag Watermark for Each Country
 */
export function CountryWatermark({ slug, className }: WatermarkProps) {
  switch (slug) {
    case "china":
      return (
        <div
          className={`pointer-events-none absolute -top-8 -right-8 h-80 w-80 select-none transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-1 ${className || ""}`}
          aria-hidden="true"
        >
          {/* Radial Ambient Color Wash */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(244,63,94,0.18)_0%,rgba(244,63,94,0.04)_50%,transparent_75%)]" />

          <svg
            viewBox="0 0 360 320"
            className="h-full w-full mix-blend-multiply opacity-[0.16] transition-opacity duration-500 group-hover:opacity-[0.26]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cnMapGrad" x1="60" y1="40" x2="320" y2="280" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#e11d48" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#be123c" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="cnStarGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Stylized China Geographic Silhouette */}
            <path
              d="M 120 40 
                 C 145 35, 175 42, 205 38 
                 C 235 32, 260 48, 285 45 
                 C 310 42, 335 55, 345 75 
                 C 355 95, 342 120, 348 140 
                 C 352 165, 330 185, 320 205 
                 C 310 225, 295 245, 275 255 
                 C 255 265, 235 250, 215 265 
                 C 195 280, 175 295, 155 285 
                 C 135 275, 125 250, 110 240 
                 C 90 230, 75 235, 60 215 
                 C 45 195, 55 170, 50 150 
                 C 45 125, 65 105, 80 85 
                 C 95 65, 105 45, 120 40 Z
                 M 220 295 C 228 290, 238 292, 240 300 C 238 308, 226 312, 220 305 Z
                 M 325 245 C 330 240, 336 242, 338 250 C 335 260, 326 265, 322 255 Z"
              fill="url(#cnMapGrad)"
              stroke="#f43f5e"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />

            {/* Latitude / Longitude Contour Ribs */}
            <path
              d="M 80 120 Q 200 135 330 110 M 65 180 Q 190 195 315 175 M 90 230 Q 195 245 275 230"
              stroke="#f43f5e"
              strokeWidth="0.75"
              strokeOpacity="0.4"
              fill="none"
            />

            {/* National Five Stars Watermark Emblem */}
            <g transform="translate(230, 60)">
              {/* Primary Large Star */}
              <polygon
                points="0,-22 6.5,-6.5 22,-6.5 10,3.5 14,19 0,9.5 -14,19 -10,3.5 -22,-6.5 -6.5,-6.5"
                fill="url(#cnStarGrad)"
                opacity="0.85"
              />
              {/* 4 Arc Stars */}
              <g fill="url(#cnStarGrad)" opacity="0.8">
                {/* Star 1 */}
                <polygon
                  points="0,-7 2,-2 7,-2 3,1 4.5,6 0,3 -4.5,6 -3,1 -7,-2 -2,-2"
                  transform="translate(30, -18) rotate(22)"
                />
                {/* Star 2 */}
                <polygon
                  points="0,-7 2,-2 7,-2 3,1 4.5,6 0,3 -4.5,6 -3,1 -7,-2 -2,-2"
                  transform="translate(38, -2) rotate(45)"
                />
                {/* Star 3 */}
                <polygon
                  points="0,-7 2,-2 7,-2 3,1 4.5,6 0,3 -4.5,6 -3,1 -7,-2 -2,-2"
                  transform="translate(38, 16) rotate(0)"
                />
                {/* Star 4 */}
                <polygon
                  points="0,-7 2,-2 7,-2 3,1 4.5,6 0,3 -4.5,6 -3,1 -7,-2 -2,-2"
                  transform="translate(30, 32) rotate(-20)"
                />
              </g>
            </g>

            {/* Subtle Native Seal / Watermark Lettering */}
            <text
              x="270"
              y="275"
              fontSize="68"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              fill="#f43f5e"
              fillOpacity="0.25"
              textAnchor="middle"
              className="select-none tracking-widest"
            >
              中国
            </text>
          </svg>
        </div>
      );

    case "india":
      return (
        <div
          className={`pointer-events-none absolute -top-8 -right-8 h-80 w-80 select-none transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-1 ${className || ""}`}
          aria-hidden="true"
        >
          {/* Radial Ambient Saffron Wash */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(245,158,11,0.18)_0%,rgba(245,158,11,0.04)_50%,transparent_75%)]" />

          <svg
            viewBox="0 0 360 320"
            className="h-full w-full mix-blend-multiply opacity-[0.17] transition-opacity duration-500 group-hover:opacity-[0.28]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="inMapGrad" x1="120" y1="30" x2="280" y2="300" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#d97706" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="inChakraGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>

            {/* Stylized Peninsular India Geographic Silhouette */}
            <path
              d="M 185 28 
                 C 200 24, 215 35, 220 50 
                 C 225 65, 240 75, 260 70 
                 C 285 65, 305 78, 320 95 
                 C 335 110, 345 130, 335 150 
                 C 320 160, 300 165, 290 180 
                 C 280 200, 270 230, 250 260 
                 C 235 282, 220 300, 205 310 
                 C 195 300, 180 270, 168 240 
                 C 155 210, 140 185, 125 170 
                 C 110 155, 90 165, 80 150 
                 C 70 135, 85 115, 95 95 
                 C 110 75, 130 65, 145 55 
                 C 160 45, 175 32, 185 28 Z
                 M 218 318 C 224 316, 228 322, 225 328 C 220 332, 215 326, 218 318 Z"
              fill="url(#inMapGrad)"
              stroke="#d97706"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />

            {/* Latitude / Longitude Arcs */}
            <path
              d="M 100 110 Q 200 130 310 100 M 130 180 Q 210 200 280 185 M 170 245 Q 210 260 250 245"
              stroke="#d97706"
              strokeWidth="0.75"
              strokeOpacity="0.4"
              fill="none"
            />

            {/* Ashoka Chakra 24-Spoke Wheel Watermark Motif */}
            <g transform="translate(240, 100)">
              {/* Radiating Sunburst Aura */}
              <circle cx="0" cy="0" r="48" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="0" cy="0" r="40" stroke="#f59e0b" strokeWidth="0.7" opacity="0.5" />
              <circle cx="0" cy="0" r="32" stroke="url(#inChakraGrad)" strokeWidth="1.6" />
              <circle cx="0" cy="0" r="28" stroke="url(#inChakraGrad)" strokeWidth="0.6" strokeDasharray="2 2" />
              <circle cx="0" cy="0" r="7" fill="url(#inChakraGrad)" />
              {/* 24 Spokes */}
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="-28"
                  x2="0"
                  y2="28"
                  stroke="url(#inChakraGrad)"
                  strokeWidth="1.1"
                  transform={`rotate(${i * 15})`}
                />
              ))}
            </g>

            {/* Subtle Native Seal / Watermark Lettering */}
            <text
              x="265"
              y="280"
              fontSize="62"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              fill="#d97706"
              fillOpacity="0.25"
              textAnchor="middle"
              className="select-none tracking-widest"
            >
              भारत
            </text>
          </svg>
        </div>
      );

    case "malaysia":
      return (
        <div
          className={`pointer-events-none absolute -top-8 -right-8 h-80 w-80 select-none transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-1 ${className || ""}`}
          aria-hidden="true"
        >
          {/* Radial Ambient Cyan/Teal Wash */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(14,165,233,0.18)_0%,rgba(14,165,233,0.04)_50%,transparent_75%)]" />

          <svg
            viewBox="0 0 360 320"
            className="h-full w-full mix-blend-multiply opacity-[0.17] transition-opacity duration-500 group-hover:opacity-[0.28]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="myMapGrad" x1="40" y1="50" x2="340" y2="280" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="myGoldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Stylized Dual Malaysia Silhouette: Peninsular (West) + Borneo (East) */}
            {/* Peninsular Malaysia */}
            <path
              d="M 65 70 
                 C 80 65, 95 80, 105 105 
                 C 115 130, 125 155, 120 180 
                 C 115 205, 105 220, 95 235 
                 C 85 240, 75 225, 70 200 
                 C 62 175, 58 145, 55 120 
                 C 52 95, 58 75, 65 70 Z"
              fill="url(#myMapGrad)"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />
            {/* East Malaysia (Sabah & Sarawak on Borneo) */}
            <path
              d="M 155 195 
                 C 175 180, 205 170, 240 160 
                 C 275 150, 310 135, 335 115 
                 C 345 130, 340 155, 320 175 
                 C 295 195, 260 215, 225 225 
                 C 195 235, 170 220, 155 195 Z"
              fill="url(#myMapGrad)"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />

            {/* Waves / Water contours of South China Sea */}
            <path
              d="M 100 135 Q 160 120 220 135 M 95 165 Q 165 150 235 165 M 90 195 Q 160 185 230 200"
              stroke="#0284c7"
              strokeWidth="0.75"
              strokeOpacity="0.4"
              fill="none"
            />

            {/* 14-Point Federal Star & Crescent Moon Emblem Watermark */}
            <g transform="translate(255, 80)">
              {/* Crescent Moon */}
              <circle cx="-12" cy="0" r="34" fill="url(#myGoldGrad)" opacity="0.85" />
              <circle cx="-3" cy="0" r="29" fill="#f0f9ff" className="transition-colors group-hover:fill-white" />

              {/* 14-Pointed Federal Star */}
              <g transform="translate(16, 0) scale(1.1)">
                {Array.from({ length: 7 }).map((_, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1="-22"
                    x2="0"
                    y2="22"
                    stroke="url(#myGoldGrad)"
                    strokeWidth="3.2"
                    transform={`rotate(${i * (180 / 7)})`}
                  />
                ))}
                <circle cx="0" cy="0" r="7" fill="url(#myGoldGrad)" />
              </g>
            </g>

            {/* Subtle Native Seal / Watermark Lettering */}
            <text
              x="260"
              y="280"
              fontSize="48"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              fill="#0284c7"
              fillOpacity="0.22"
              textAnchor="middle"
              className="select-none tracking-[0.22em]"
            >
              MALAYSIA
            </text>
          </svg>
        </div>
      );

    case "south-korea":
      return (
        <div
          className={`pointer-events-none absolute -top-8 -right-8 h-80 w-80 select-none transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-1 ${className || ""}`}
          aria-hidden="true"
        >
          {/* Radial Ambient Purple / Royal Blue Wash */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(168,85,247,0.18)_0%,rgba(168,85,247,0.04)_50%,transparent_75%)]" />

          <svg
            viewBox="0 0 360 320"
            className="h-full w-full mix-blend-multiply opacity-[0.17] transition-opacity duration-500 group-hover:opacity-[0.28]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="krMapGrad" x1="120" y1="30" x2="300" y2="280" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#9333ea" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="krRedGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="krBlueGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>

            {/* Stylized South Korea Geographic Peninsula Silhouette */}
            <path
              d="M 160 45 
                 C 195 42, 230 48, 255 52 
                 C 275 80, 290 120, 285 160 
                 C 280 195, 265 225, 250 250 
                 C 235 265, 215 260, 195 245 
                 C 175 230, 155 210, 145 180 
                 C 135 150, 140 120, 142 90 
                 C 145 70, 150 50, 160 45 Z
                 M 165 285 C 172 280, 182 282, 185 290 C 182 298, 170 302, 165 295 Z"
              fill="url(#krMapGrad)"
              stroke="#9333ea"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeDasharray="4 2"
            />

            {/* Contour lines */}
            <path
              d="M 150 100 Q 210 115 280 95 M 140 160 Q 210 175 280 155 M 150 220 Q 210 230 255 215"
              stroke="#9333ea"
              strokeWidth="0.75"
              strokeOpacity="0.4"
              fill="none"
            />

            {/* Taegeuk Yin-Yang & Trigrams Emblem Watermark */}
            <g transform="translate(245, 90)">
              {/* Ambient Outer Halo */}
              <circle cx="0" cy="0" r="44" stroke="#9333ea" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />

              {/* Central Taegeuk Circle */}
              <g transform="rotate(-34)">
                <path
                  d="M -24 0 A 24 24 0 0 1 24 0 A 12 12 0 0 1 0 0 A 12 12 0 0 0 -24 0 Z"
                  fill="url(#krRedGrad)"
                  opacity="0.85"
                />
                <path
                  d="M 24 0 A 24 24 0 0 1 -24 0 A 12 12 0 0 1 0 0 A 12 12 0 0 0 24 0 Z"
                  fill="url(#krBlueGrad)"
                  opacity="0.85"
                />
              </g>

              {/* 4 Trigrams (Taegukgi) */}
              {/* Geon (Top-Left: 3 unbroken) */}
              <g transform="translate(-34, -28) rotate(34)" stroke="#1e293b" strokeWidth="2.2" opacity="0.75">
                <line x1="-10" y1="-5" x2="10" y2="-5" />
                <line x1="-10" y1="0" x2="10" y2="0" />
                <line x1="-10" y1="5" x2="10" y2="5" />
              </g>
              {/* Gon (Bottom-Right: 3 broken) */}
              <g transform="translate(34, 28) rotate(34)" stroke="#1e293b" strokeWidth="2.2" opacity="0.75">
                <line x1="-10" y1="-5" x2="-2" y2="-5" />
                <line x1="2" y1="-5" x2="10" y2="-5" />
                <line x1="-10" y1="0" x2="-2" y2="0" />
                <line x1="2" y1="0" x2="10" y2="0" />
                <line x1="-10" y1="5" x2="-2" y2="5" />
                <line x1="2" y1="5" x2="10" y2="5" />
              </g>
              {/* Gam (Top-Right: broken, unbroken, broken) */}
              <g transform="translate(34, -28) rotate(-34)" stroke="#1e293b" strokeWidth="2.2" opacity="0.75">
                <line x1="-10" y1="-5" x2="-2" y2="-5" />
                <line x1="2" y1="-5" x2="10" y2="-5" />
                <line x1="-10" y1="0" x2="5" y2="0" />
                <line x1="-10" y1="5" x2="-2" y2="5" />
                <line x1="2" y1="5" x2="10" y2="5" />
              </g>
              {/* Ri (Bottom-Left: unbroken, broken, unbroken) */}
              <g transform="translate(-34, 28) rotate(-34)" stroke="#1e293b" strokeWidth="2.2" opacity="0.75">
                <line x1="-10" y1="-5" x2="10" y2="-5" />
                <line x1="-10" y1="0" x2="-2" y2="0" />
                <line x1="2" y1="0" x2="10" y2="0" />
                <line x1="-10" y1="5" x2="10" y2="5" />
              </g>
            </g>

            {/* Subtle Native Seal / Watermark Lettering */}
            <text
              x="265"
              y="280"
              fontSize="56"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              fill="#9333ea"
              fillOpacity="0.22"
              textAnchor="middle"
              className="select-none tracking-widest"
            >
              대한민국
            </text>
          </svg>
        </div>
      );
  }
}
