"use client";

import { motion } from "framer-motion";
import type { Locale } from "@/lib/i18n/config";

interface HeroFloatingArtProps {
  locale: Locale;
}

/**
 * Enhanced Bespoke Vector Art 1: Graduation Mortarboard & Honors Diploma
 */
function GraduationCapVector() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="size-[48px] drop-shadow-[0_6px_14px_rgba(245,158,11,0.25)] transition-transform duration-300 group-hover:scale-110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="capTop" x1="14" y1="18" x2="66" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>
        <linearGradient id="capRim" x1="14" y1="18" x2="66" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="capGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="scrollPaper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="ribbonRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>

      {/* Ambient Spotlight */}
      <circle cx="40" cy="40" r="32" fill="#f59e0b" fillOpacity="0.1" />

      {/* Diploma Scroll (Tilted behind cap) */}
      <g transform="rotate(-18 38 52)">
        <rect x="18" y="45" width="40" height="12" rx="4" fill="url(#scrollPaper)" stroke="#cbd5e1" strokeWidth="1" />
        <ellipse cx="18" cy="51" rx="2" ry="6" fill="#e2e8f0" />
        <ellipse cx="58" cy="51" rx="2" ry="6" fill="#ffffff" />
        {/* Red Silk Ribbon Band */}
        <rect x="35" y="44.5" width="6.5" height="13" fill="url(#ribbonRed)" rx="1.5" />
        {/* Ribbon Hanging Tails */}
        <path d="M36 57.5L34 65L38 63.5L40 65L39 57.5" fill="url(#ribbonRed)" />
        {/* Golden Wax Seal */}
        <circle cx="38" cy="51" r="3.2" fill="url(#capGold)" />
      </g>

      {/* Cap Skullcap Base */}
      <path
        d="M27 33C27 33 28 45 40 45C52 45 53 33 53 33"
        fill="#0b1324"
        stroke="#1e293b"
        strokeWidth="1.6"
      />

      {/* 3D Mortarboard Top Rhombus */}
      <polygon
        points="40,16 68,29 40,42 12,29"
        fill="url(#capTop)"
        stroke="url(#capRim)"
        strokeWidth="1.2"
      />
      {/* Specular Bevel Line */}
      <polyline
        points="13,29 40,17 67,29"
        stroke="#67e8f9"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Center Gold Button */}
      <circle cx="40" cy="29" r="3" fill="url(#capGold)" />
      <circle cx="40" cy="29" r="1.4" fill="#fef08a" />

      {/* Flowing Gold Tassel */}
      <path
        d="M40 29C47 30 56 34 57 42C57.5 46 58 48 58 52"
        stroke="url(#capGold)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tassel Hanging Fringe */}
      <path d="M56 51L59 51L60 60L55 60Z" fill="url(#capGold)" />
      <circle cx="57.5" cy="51" r="1.6" fill="#fef08a" />

      {/* Sparkling 4-Point Stars */}
      <path
        d="M66 14L67 17.5L70.5 18.5L67 19.5L66 23L65 19.5L61.5 18.5L65 17.5Z"
        fill="#fbbf24"
      />
      <circle cx="16" cy="18" r="1.6" fill="#38bdf8" />
    </svg>
  );
}

/**
 * Enhanced Bespoke Vector Art 2: Biometric Passport & "VISA APPROVED" Emerald Seal
 */
function VisaPassportVector() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="size-[48px] drop-shadow-[0_6px_14px_rgba(16,185,129,0.25)] transition-transform duration-300 group-hover:scale-110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="passCover" x1="12" y1="12" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f2b48" />
          <stop offset="60%" stopColor="#08182b" />
          <stop offset="100%" stopColor="#040d18" />
        </linearGradient>
        <linearGradient id="visaStamp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="goldEmboss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Ambient Glow */}
      <circle cx="40" cy="40" r="32" fill="#10b981" fillOpacity="0.1" />

      {/* Boarding Pass Flight Ticket peeking from behind */}
      <g transform="rotate(10 40 40)">
        <rect x="24" y="11" width="36" height="50" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="28" y="15" width="28" height="4" rx="2" fill="#0ea5e9" fillOpacity="0.3" />
        <line x1="28" y1="23" x2="52" y2="23" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="28" y="31" fill="#0f172a" fontSize="5.5" fontWeight="900" fontFamily="system-ui">
          DAC ➔ INT
        </text>
      </g>

      {/* Biometric Passport Booklet */}
      <g transform="rotate(-6 32 40)">
        <rect
          x="15"
          y="15"
          width="36"
          height="52"
          rx="5"
          fill="url(#passCover)"
          stroke="#38bdf8"
          strokeWidth="1.1"
        />
        {/* Spine Crease Line */}
        <line x1="20" y1="15" x2="20" y2="67" stroke="#1e3a5f" strokeWidth="1.4" />

        {/* Embossed Gold Globe Emblem */}
        <circle cx="33" cy="36" r="7.5" stroke="url(#goldEmboss)" strokeWidth="1" fill="none" opacity="0.95" />
        <ellipse cx="33" cy="36" rx="7.5" ry="3.8" stroke="url(#goldEmboss)" strokeWidth="0.8" fill="none" opacity="0.95" />
        <line x1="33" y1="28.5" x2="33" y2="43.5" stroke="url(#goldEmboss)" strokeWidth="0.8" opacity="0.95" />
        <line x1="25.5" y1="36" x2="40.5" y2="36" stroke="url(#goldEmboss)" strokeWidth="0.8" opacity="0.95" />

        {/* Passport Title Lines */}
        <rect x="25" y="21" width="16" height="2.2" rx="1" fill="url(#goldEmboss)" opacity="0.95" />
        <rect x="27" y="48" width="12" height="1.6" rx="0.8" fill="url(#goldEmboss)" opacity="0.75" />

        {/* Biometric Chip Icon */}
        <rect x="31" y="54" width="4.8" height="3.2" rx="0.6" stroke="url(#goldEmboss)" strokeWidth="0.75" fill="none" />
        <line x1="29.5" y1="55.6" x2="37.5" y2="55.6" stroke="url(#goldEmboss)" strokeWidth="0.75" />
      </g>

      {/* "VISA APPROVED" Emerald Seal Badge */}
      <g transform="translate(38, 36)">
        <circle cx="18" cy="18" r="16.5" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="13.5" fill="url(#visaStamp)" />
        {/* Tilted Checkmark */}
        <path
          d="M12.5 18L16.5 22L24 13.5"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="7.5" r="1.1" fill="#fef08a" />
        <circle cx="18" cy="28.5" r="1.1" fill="#fef08a" />
      </g>

      {/* Sparkles */}
      <path
        d="M66 26L67 29.5L70.5 30.5L67 31.5L66 35L65 31.5L61.5 30.5L65 29.5Z"
        fill="#10b981"
        opacity="0.9"
      />
    </svg>
  );
}

/**
 * Enhanced Bespoke Vector Art 3: 100% Government Full Scholarship Medal & Certificate
 */
function ScholarshipMedalVector() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="size-[48px] drop-shadow-[0_6px_14px_rgba(147,51,234,0.25)] transition-transform duration-300 group-hover:scale-110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="medalGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="purpleRibbon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="60%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>
        <linearGradient id="certBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
      </defs>

      {/* Ambient Purple Glow */}
      <circle cx="40" cy="40" r="32" fill="#9333ea" fillOpacity="0.1" />

      {/* Scholarship Certificate Sheet */}
      <g transform="rotate(-6 40 40)">
        <rect x="21" y="12" width="38" height="48" rx="4" fill="url(#certBg)" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="24" y="15" width="32" height="42" rx="2" stroke="url(#medalGold)" strokeWidth="0.8" strokeDasharray="2 1" fill="none" />
        <rect x="29" y="19" width="22" height="2.8" rx="1" fill="#9333ea" />
        <line x1="27" y1="26" x2="53" y2="26" stroke="#cbd5e1" strokeWidth="1.3" />
        <line x1="27" y1="30" x2="49" y2="30" stroke="#cbd5e1" strokeWidth="1.3" />
      </g>

      {/* Ribbon Drape (V-shape) */}
      <path d="M29 27L40 45L36 27" fill="url(#purpleRibbon)" />
      <path d="M51 27L40 45L44 27" fill="#7e22ce" />

      {/* Gleaming Golden Medal */}
      <circle cx="40" cy="48" r="17" fill="url(#medalGold)" stroke="#fef08a" strokeWidth="1.6" />
      <circle cx="40" cy="48" r="13.8" fill="#0f172a" stroke="url(#medalGold)" strokeWidth="1.1" />

      {/* Laurel Wreath */}
      <path
        d="M30 48C30 53.5 34.5 58 40 58C45.5 58 50 53.5 50 48"
        stroke="url(#medalGold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Center Star */}
      <polygon
        points="40,41 42,45.5 47,46 43,49.5 44.5,54.5 40,51.5 35.5,54.5 37,49.5 33,46 38,45.5"
        fill="url(#medalGold)"
      />

      {/* Radiant Star Burst */}
      <path
        d="M62 18L63 21.5L66.5 22.5L63 23.5L62 27L61 23.5L57.5 22.5L61 21.5Z"
        fill="#fbbf24"
      />
      <circle cx="16" cy="32" r="1.6" fill="#c084fc" />
    </svg>
  );
}

/**
 * Enhanced Bespoke Vector Art 4: Partner University Campus & Global Compass
 */
function UniversityCampusVector() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="size-[48px] drop-shadow-[0_6px_14px_rgba(244,63,94,0.25)] transition-transform duration-300 group-hover:scale-110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="domeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="columnGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {/* Ambient Rose Glow */}
      <circle cx="40" cy="40" r="32" fill="#f43f5e" fillOpacity="0.1" />

      {/* Global Compass Ring in Background */}
      <circle cx="40" cy="40" r="25" stroke="#fecdd3" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6" />
      <ellipse cx="40" cy="40" rx="25" ry="9.5" stroke="#fecdd3" strokeWidth="0.8" fill="none" opacity="0.4" />

      {/* University Foundation Steps */}
      <rect x="15" y="58" width="50" height="4.5" rx="1" fill="#cbd5e1" />
      <rect x="17" y="55" width="46" height="3.5" fill="#e2e8f0" />

      {/* Neoclassical Columns */}
      <rect x="20" y="35" width="4.5" height="20" rx="1" fill="url(#columnGrad)" stroke="#cbd5e1" strokeWidth="0.5" />
      <rect x="30" y="35" width="4.5" height="20" rx="1" fill="url(#columnGrad)" stroke="#cbd5e1" strokeWidth="0.5" />
      <rect x="45" y="35" width="4.5" height="20" rx="1" fill="url(#columnGrad)" stroke="#cbd5e1" strokeWidth="0.5" />
      <rect x="55" y="35" width="4.5" height="20" rx="1" fill="url(#columnGrad)" stroke="#cbd5e1" strokeWidth="0.5" />

      {/* Central Grand Entrance Arch */}
      <path d="M35.5 55V44C35.5 41.5 37.5 39.5 40 39.5C42.5 39.5 44.5 41.5 44.5 44V55H35.5Z" fill="#0f172a" />

      {/* Architrave Beam */}
      <rect x="17" y="32" width="46" height="4" rx="0.6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />

      {/* Classical Triangular Pediment Roof */}
      <polygon points="40,18 65,32 15,32" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="40" cy="27" r="2.8" fill="url(#domeGrad)" />

      {/* Central Domed Cupola Tower */}
      <rect x="35.5" y="11" width="9" height="9" rx="1" fill="#e2e8f0" />
      <path d="M35.5 11C35.5 6 44.5 6 44.5 11H35.5Z" fill="url(#domeGrad)" />
      {/* Flagpole & Pennant */}
      <line x1="40" y1="6" x2="40" y2="1.5" stroke="#e11d48" strokeWidth="1.2" />
      <polygon points="40,1.5 46,3.8 40,6" fill="#e11d48" />

      {/* Victory Laurels */}
      <path d="M12 50C11 54.5 13 58.5 16.5 61" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M68 50C69 54.5 67 58.5 63.5 61" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* Gold Star */}
      <polygon points="40,25 40.7,26.6 42.4,26.7 41,27.9 41.4,29.5 40,28.5 38.6,29.5 39,27.9 37.6,26.7 39.3,26.6" fill="#fef08a" />
    </svg>
  );
}

/**
 * Premium Glassmorphic Floating Art Card
 */
interface FloatingCardProps {
  vector: React.ReactNode;
  tag: string;
  tagColor: string;
  tagDotColor: string;
  perk: string;
  perkColor: string;
  title: string;
  subtitle: string;
  positionClass: string;
  podGradient: string;
  hoverGlow: string;
  floatY: number[];
  floatRotate: number[];
  duration: number;
  delay: number;
  initialX: number;
}

function FloatingCard({
  vector,
  tag,
  tagColor,
  tagDotColor,
  perk,
  perkColor,
  title,
  subtitle,
  positionClass,
  podGradient,
  hoverGlow,
  floatY,
  floatRotate,
  duration,
  delay,
  initialX,
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, scale: 0.92 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
        y: floatY,
        rotate: floatRotate,
      }}
      transition={{
        opacity: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] },
        x: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] },
        y: {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: duration * 1.15,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className={`pointer-events-auto absolute ${positionClass}`}
    >
      <motion.div
        whileHover={{ scale: 1.04, y: -6 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className={`group relative flex w-[285px] items-center gap-3.5 rounded-[1.35rem] border border-stone-200/90 bg-white/95 p-3.5 shadow-[0_12px_32px_rgba(15,23,42,0.07)] backdrop-blur-xl transition-all duration-300 ${hoverGlow}`}
      >
        {/* Top Specular Inner Reflection Line */}
        <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />

        {/* Dedicated Vector Art Pod Container */}
        <div className={`relative flex size-[62px] shrink-0 items-center justify-center rounded-2xl border ${podGradient} shadow-xs`}>
          {/* Inner ambient spotlight */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/40" />
          <div className="relative z-10">
            {vector}
          </div>
        </div>

        {/* Text, Tag & Trust Chip Content */}
        <div className="flex min-w-0 flex-1 flex-col text-left">
          {/* Status Pill Badge */}
          <div className="flex items-center justify-between gap-1">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.62rem] font-black tracking-wider uppercase ${tagColor}`}>
              <span className={`size-1.5 animate-pulse rounded-full ${tagDotColor}`} />
              {tag}
            </span>
          </div>

          {/* Primary Title */}
          <h4 className="font-heading mt-1 truncate text-[0.84rem] font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-slate-950">
            {title}
          </h4>

          {/* Descriptive Subtitle */}
          <p className="truncate text-[0.68rem] font-medium text-slate-500">
            {subtitle}
          </p>

          {/* Bottom Trust/Perk Micro-Badge */}
          <div className="mt-1.5 flex items-center">
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold ${perkColor}`}>
              {perk}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Floating decorative micro-particle
 */
function FloatingParticle({
  className,
  children,
  floatY,
  duration,
  delay,
}: {
  className: string;
  children: React.ReactNode;
  floatY: number[];
  duration: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [0.9, 1.15, 0.9],
        y: floatY,
      }}
      transition={{
        opacity: { duration: duration * 0.8, repeat: Infinity, ease: "easeInOut" },
        scale: { duration, repeat: Infinity, ease: "easeInOut" },
        y: { duration, repeat: Infinity, ease: "easeInOut" },
        delay,
      }}
      className={`pointer-events-none absolute ${className}`}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}

export function HeroFloatingArt({ locale }: HeroFloatingArtProps) {
  const isBn = locale === "bn";

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {/* 
        ========================================================================
        LEFT FLANK FLOATING VECTOR ART ITEMS
        ========================================================================
      */}

      {/* Left Item 1: Academic Excellence (Graduation Mortarboard & Honors Diploma) */}
      <FloatingCard
        vector={<GraduationCapVector />}
        tag={isBn ? "শীর্ষ বিশ্ববিদ্যালয়" : "Top 1% Global"}
        tagColor="bg-amber-50 text-amber-800 border border-amber-200/80"
        tagDotColor="bg-amber-500"
        perk={isBn ? "⚡ কিউএস শীর্ষ র‍্যাংকড" : "⚡ QS Top Ranked Campuses"}
        perkColor="bg-amber-50/90 text-amber-700 border border-amber-200/60"
        title={isBn ? "ওয়ার্ল্ড-ক্লাস অ্যাডমিশন" : "World-Class Admissions"}
        subtitle={isBn ? "ডাইরেক্ট অফার লেটার ও ওয়েভার" : "Direct Offer Letters & Waivers"}
        podGradient="bg-gradient-to-br from-amber-100/70 via-orange-50/50 to-amber-50/30 border-amber-200/70"
        hoverGlow="hover:border-amber-300/90 hover:shadow-[0_20px_45px_-10px_rgba(245,158,11,0.22)]"
        positionClass="hidden lg:flex top-48 sm:top-52 xl:top-56 2xl:top-64 left-3 sm:left-6 lg:left-4 xl:left-8 2xl:left-14"
        floatY={[0, -12, 0]}
        floatRotate={[-1.5, 1.5, -1.5]}
        duration={5.2}
        delay={0.15}
        initialX={-35}
      />

      {/* Left Item 2: Visa Success (Biometric Passport & Emerald Stamp) */}
      <FloatingCard
        vector={<VisaPassportVector />}
        tag={isBn ? "ভিসা সাফল্য" : "98.4% Visa Rate"}
        tagColor="bg-emerald-50 text-emerald-800 border border-emerald-200/80"
        tagDotColor="bg-emerald-500"
        perk={isBn ? "✓ ১০০% ফাইল ভেরিফিকেশন" : "✓ 100% File Verification"}
        perkColor="bg-emerald-50/90 text-emerald-700 border border-emerald-200/60"
        title={isBn ? "নিশ্চিত ভিসা প্রসেসিং" : "Embassy Visa Approved"}
        subtitle={isBn ? "JW202, EMGS ও D-2 ফাইলিং" : "JW202, EMGS & D-2 Filing"}
        podGradient="bg-gradient-to-br from-emerald-100/70 via-teal-50/50 to-emerald-50/30 border-emerald-200/70"
        hoverGlow="hover:border-emerald-300/90 hover:shadow-[0_20px_45px_-10px_rgba(16,185,129,0.22)]"
        positionClass="hidden lg:flex top-[410px] sm:top-[440px] xl:top-[470px] 2xl:top-[510px] left-4 sm:left-8 lg:left-6 xl:left-10 2xl:left-16"
        floatY={[0, 14, 0]}
        floatRotate={[1.5, -1.5, 1.5]}
        duration={5.8}
        delay={0.3}
        initialX={-40}
      />

      {/* 
        ========================================================================
        RIGHT FLANK FLOATING VECTOR ART ITEMS
        ========================================================================
      */}

      {/* Right Item 1: Government Full Scholarship (Gold Medal & Certificate) */}
      <FloatingCard
        vector={<ScholarshipMedalVector />}
        tag={isBn ? "১০০% স্কলারশিপ" : "Govt. Grants"}
        tagColor="bg-purple-50 text-purple-800 border border-purple-200/80"
        tagDotColor="bg-purple-500"
        perk={isBn ? "★ টিউশন + মাসিক স্টাইপেন্ড" : "★ Tuition + Monthly Stipend"}
        perkColor="bg-purple-50/90 text-purple-700 border border-purple-200/60"
        title={isBn ? "ফুল ফ্রি সরকারি স্কলারশিপ" : "Govt. Full Scholarships"}
        subtitle={isBn ? "CSC, GKS ও মেরিট ওয়েভার" : "CSC, GKS & Merit Waivers"}
        podGradient="bg-gradient-to-br from-purple-100/70 via-indigo-50/50 to-purple-50/30 border-purple-200/70"
        hoverGlow="hover:border-purple-300/90 hover:shadow-[0_20px_45px_-10px_rgba(147,51,234,0.22)]"
        positionClass="hidden lg:flex top-48 sm:top-52 xl:top-56 2xl:top-64 right-3 sm:right-6 lg:right-4 xl:right-8 2xl:right-14"
        floatY={[0, -12, 0]}
        floatRotate={[-1.5, 1.5, -1.5]}
        duration={5.6}
        delay={0.2}
        initialX={35}
      />

      {/* Right Item 2: Partner University Campus & World Reach */}
      <FloatingCard
        vector={<UniversityCampusVector />}
        tag={isBn ? "গ্লোবাল ক্যাম্পাস" : "Global Network"}
        tagColor="bg-rose-50 text-rose-800 border border-rose-200/80"
        tagDotColor="bg-rose-500"
        perk={isBn ? "✦ ডাইরেক্ট সরকারি স্বীকৃতি" : "✦ Direct MoE Accreditation"}
        perkColor="bg-rose-50/90 text-rose-700 border border-rose-200/60"
        title={isBn ? "৪০+ পার্টনার বিশ্ববিদ্যালয়" : "40+ Partner Campuses"}
        subtitle={isBn ? "চীন, মালয়েশিয়া, দক্ষিণ কোরিয়া ও ইউরোপ" : "China, Malaysia, South Korea, EU"}
        podGradient="bg-gradient-to-br from-rose-100/70 via-orange-50/50 to-rose-50/30 border-rose-200/70"
        hoverGlow="hover:border-rose-300/90 hover:shadow-[0_20px_45px_-10px_rgba(244,63,94,0.22)]"
        positionClass="hidden lg:flex top-[410px] sm:top-[440px] xl:top-[470px] 2xl:top-[510px] right-4 sm:right-8 lg:right-6 xl:right-10 2xl:right-16"
        floatY={[0, 14, 0]}
        floatRotate={[1.5, -1.5, 1.5]}
        duration={5.2}
        delay={0.35}
        initialX={40}
      />

      {/* 
        ========================================================================
        FLOATING AMBIENT VECTOR PARTICLES
        ========================================================================
      */}
      {/* Golden Star Left */}
      <FloatingParticle className="hidden lg:block top-[350px] left-[16%] xl:left-[20%]" floatY={[0, -8, 0]} duration={3.8} delay={0.2}>
        <svg viewBox="0 0 24 24" className="size-5 text-amber-400 fill-amber-400 drop-shadow-sm">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
        </svg>
      </FloatingParticle>

      {/* Cyan Star Right */}
      <FloatingParticle className="hidden lg:block top-[340px] right-[16%] xl:right-[20%]" floatY={[0, 9, 0]} duration={4.2} delay={0.4}>
        <svg viewBox="0 0 24 24" className="size-4.5 text-cyan-400 fill-cyan-400 drop-shadow-sm">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
        </svg>
      </FloatingParticle>

      {/* Rose Sparkle Lower Right */}
      <FloatingParticle className="hidden xl:block top-[520px] right-[24%]" floatY={[0, -7, 0]} duration={4.5} delay={0.6}>
        <svg viewBox="0 0 20 20" className="size-4 text-rose-400 fill-rose-400">
          <polygon points="10,0 12,7 19,10 12,13 10,20 8,13 1,10 8,7" />
        </svg>
      </FloatingParticle>
    </div>
  );
}
