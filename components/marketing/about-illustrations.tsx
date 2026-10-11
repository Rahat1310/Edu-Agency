import React from "react";
import { BookOpen, Building2, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Illustration A — Education Journey
 * A student beginning an international education journey:
 * University building, academic documents, graduation cap, travel path, and destination markers.
 */
export function EducationJourneyIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#f8f9fa] p-6 sm:p-8",
        className,
      )}
    >
      {/* Background ambient radial glow */}

      <svg
        viewBox="0 0 540 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full max-w-[480px] drop-shadow-xs transition-transform duration-500 hover:scale-[1.01]"
        role="img"
        aria-label="Illustration of an international education journey with university architecture, travel trajectory, and graduation honours"
      >
        <defs>
          <linearGradient id="eduNavy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="eduSunset" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="60%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>
          <linearGradient id="eduGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="eduSky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="eduEmerald" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="8"
              floodColor="#0F172A"
              floodOpacity="0.08"
            />
          </filter>
        </defs>

        {/* Horizon Grid / Latitudinal Lines */}
        <g opacity="0.35">
          <ellipse
            cx="270"
            cy="330"
            rx="230"
            ry="40"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <ellipse
            cx="270"
            cy="310"
            rx="190"
            ry="32"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <line
            x1="40"
            y1="310"
            x2="500"
            y2="310"
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </g>

        {/* Global Campus Architecture (Subtle Classical/Modern University Pediment) */}
        <g filter="url(#softShadow)">
          {/* Base Steps */}
          <rect x="70" y="270" width="180" height="8" rx="2" fill="#E2E8F0" />
          <rect x="80" y="264" width="160" height="6" rx="2" fill="#CBD5E1" />
          <rect x="90" y="258" width="140" height="6" rx="2" fill="#94A3B8" />

          {/* Pillars */}
          <rect
            x="98"
            y="195"
            width="12"
            height="63"
            rx="2"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <rect
            x="134"
            y="195"
            width="12"
            height="63"
            rx="2"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <rect
            x="174"
            y="195"
            width="12"
            height="63"
            rx="2"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <rect
            x="210"
            y="195"
            width="12"
            height="63"
            rx="2"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="1"
          />

          {/* Archway Door */}
          <path
            d="M148 258V215C148 206 172 206 172 215V258H148Z"
            fill="url(#eduNavy)"
          />

          {/* Entablature & Pediment (Roof Triangle) */}
          <rect x="85" y="187" width="150" height="8" rx="2" fill="#64748B" />
          <polygon points="160,135 75,187 245,187" fill="#0F172A" />

          {/* Classical Dome */}
          <path d="M130 135C130 102 190 102 190 135Z" fill="url(#eduSunset)" />
          <line
            x1="160"
            y1="102"
            x2="160"
            y2="90"
            stroke="#FF7A00"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="160" cy="88" r="3" fill="#F59E0B" />
        </g>

        {/* Dynamic Curved Flight/Guidance Trajectory Arc */}
        <path
          d="M160 110 C 220 30, 340 40, 420 140 C 450 180, 420 250, 470 270"
          stroke="url(#eduSunset)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 6"
        />

        {/* Flight Navigation Waypoints */}
        <circle cx="270" cy="52" r="5" fill="#FF4500" />
        <circle
          cx="270"
          cy="52"
          r="9"
          stroke="#FF4500"
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />

        <circle cx="378" cy="88" r="4.5" fill="#F59E0B" />
        <circle cx="438" cy="180" r="4.5" fill="#0284C7" />

        {/* Academic Documents & Portfolio Dossier (Central Right) */}
        <g filter="url(#softShadow)" transform="translate(280, 150)">
          {/* Under sheet */}
          <rect
            x="18"
            y="14"
            width="130"
            height="155"
            rx="10"
            fill="#F1F5F9"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            transform="rotate(7 83 91)"
          />

          {/* Main Acceptance Dossier */}
          <rect
            x="0"
            y="0"
            width="135"
            height="160"
            rx="12"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />

          {/* Document Header Bar */}
          <rect
            x="14"
            y="16"
            width="55"
            height="7"
            rx="3.5"
            fill="url(#eduSunset)"
          />
          <rect x="14" y="30" width="105" height="4" rx="2" fill="#E2E8F0" />
          <rect x="14" y="40" width="95" height="4" rx="2" fill="#F1F5F9" />
          <rect x="14" y="50" width="80" height="4" rx="2" fill="#F1F5F9" />

          {/* Academic document seal */}
          <circle
            cx="95"
            cy="115"
            r="22"
            fill="#FFF7ED"
            stroke="#FDBA74"
            strokeWidth="1.5"
          />
          <circle cx="95" cy="115" r="16" fill="url(#eduSunset)" />
          <path
            d="M89 115L93 119L101 111"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Academic Checklist lines */}
          <circle cx="22" cy="72" r="4" fill="url(#eduEmerald)" />
          <rect x="32" y="70" width="50" height="4" rx="2" fill="#94A3B8" />

          <circle cx="22" cy="88" r="4" fill="url(#eduEmerald)" />
          <rect x="32" y="86" width="45" height="4" rx="2" fill="#94A3B8" />

          <circle cx="22" cy="104" r="4" fill="url(#eduEmerald)" />
          <rect x="32" y="102" width="38" height="4" rx="2" fill="#94A3B8" />
        </g>

        {/* Floating Mortarboard Cap (Top-Right Hero Accolade) */}
        <g
          filter="url(#softShadow)"
          transform="translate(360, 48) rotate(-10 60 50)"
        >
          {/* Under cap skull */}
          <path d="M38 46C38 58 78 58 78 46" fill="#090D16" />
          {/* Diamond Mortarboard Top */}
          <polygon
            points="58,16 108,36 58,56 8,36"
            fill="url(#eduNavy)"
            stroke="#38BDF8"
            strokeWidth="0.8"
          />
          {/* Golden Button & Tassel */}
          <circle cx="58" cy="36" r="3.5" fill="url(#eduGold)" />
          <path
            d="M58 36 C 68 40, 85 45, 92 62"
            stroke="url(#eduGold)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <rect
            x="88"
            y="60"
            width="7"
            height="12"
            rx="1.5"
            fill="url(#eduGold)"
          />
        </g>

        {/* Floating Destination Compass Badge (Bottom-Right) */}
        <g filter="url(#softShadow)" transform="translate(415, 230)">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="#FFFFFF"
            stroke="#FED7AA"
            strokeWidth="2"
          />
          <circle cx="40" cy="40" r="28" fill="#FFF7ED" />
          {/* Compass Star Needle */}
          <polygon points="40,18 45,37 40,40" fill="url(#eduSunset)" />
          <polygon points="40,62 35,43 40,40" fill="#94A3B8" />
          <polygon points="18,40 37,35 40,40" fill="#CBD5E1" />
          <polygon points="62,40 43,45 40,40" fill="#F97316" />
          <circle cx="40" cy="40" r="3.5" fill="#0F172A" />
        </g>

        {/* Destination Location Badges Floating */}
        <g transform="translate(24, 90)">
          <rect
            x="0"
            y="0"
            width="112"
            height="34"
            rx="17"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1"
            filter="url(#softShadow)"
          />
          <circle cx="17" cy="17" r="7" fill="url(#eduSunset)" />
          <text
            x="32"
            y="21"
            fill="#0F172A"
            fontSize="11"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            8+ Years Depth
          </text>
        </g>

        <g transform="translate(370, 310)">
          <rect
            x="0"
            y="0"
            width="128"
            height="32"
            rx="16"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1"
            filter="url(#softShadow)"
          />
          <circle cx="16" cy="16" r="6" fill="url(#eduEmerald)" />
          <text
            x="30"
            y="20"
            fill="#0F172A"
            fontSize="11"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            Visa Guidance
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Illustration B — Our Journey Timeline
 * A horizontal/vertical timeline showing the real company progression:
 * 1. China-Focused Experience (8+ years through earlier business)
 * 2. Establishment of Study Abroad Consultant (New Identity)
 * 3. Broader study opportunities and the agency’s direction
 */
export function TimelineJourneyIllustration({
  className,
  locale = "en",
}: {
  className?: string;
  locale?: "en" | "bn";
}) {
  const isBn = locale === "bn";
  const milestones = [
    {
      icon: BookOpen,
      label: isBn ? "টিমের পূর্ব অভিজ্ঞতা" : "Earlier team experience",
      marker: isBn ? "৮+ বছর" : "8+ years",
      title: isBn
        ? "ঢাকা থেকে চীন-কেন্দ্রিক সেবা"
        : "China-focused work from Dhaka",
      body: isBn
        ? "ঢাকায় পূর্ববর্তী একটি প্রতিষ্ঠানের মাধ্যমে আমাদের টিম চীনে বিশ্ববিদ্যালয়ে ভর্তি, স্কলারশিপ গাইডেন্স ও কাগজপত্র প্রস্তুতিতে আট বছরেরও বেশি অভিজ্ঞতা অর্জন করে।"
        : "Our team worked in Dhaka for more than eight years through an earlier China-focused education business, developing admissions, scholarship, and documentation experience.",
      detail: isBn
        ? "ভর্তি · স্কলারশিপ · কাগজপত্র"
        : "Admissions · Scholarships · Documentation",
    },
    {
      icon: Building2,
      label: isBn ? "নতুন ব্র্যান্ড পরিচয়" : "New brand identity",
      marker: isBn ? "ফেব্রুয়ারি ২০২৬" : "February 2026",
      title: isBn
        ? "নতুন পরিচয়ে সম্প্রসারণ"
        : "Expansion under a new identity",
      body: isBn
        ? "ঢাকায় চলমান কাজকে Study Abroad Consultant নামে নতুন ব্র্যান্ড পরিচয়ে সম্প্রসারিত করি, আরও বেশি গন্তব্যে কাউন্সেলিং ও আবেদন সহায়তা দিতে।"
        : "We expanded our existing Dhaka-based work under the brand Study Abroad Consultant, extending our counselling and application support to more destinations.",
      detail: isBn
        ? "Study Abroad Consultant · ঢাকা"
        : "Study Abroad Consultant · Dhaka",
    },
    {
      icon: Globe2,
      label: isBn ? "বর্তমান সেবার পরিধি" : "Where we are today",
      marker: isBn ? "৫টি গন্তব্য" : "5 destinations",
      title: isBn
        ? "চীনের অভিজ্ঞতা, আরও বিস্তৃত সুযোগ"
        : "Experience beyond borders",
      body: isBn
        ? "এখন আমরা চীন, ভারত, মালয়েশিয়া, দক্ষিণ কোরিয়া ও জাপানে উচ্চশিক্ষার পরিকল্পনায় বাংলাদেশি শিক্ষার্থী ও পরিবারকে সহায়তা করি।"
        : "Today, we support Bangladeshi students and families exploring higher education in China, India, Malaysia, South Korea, and Japan.",
      detail: isBn
        ? "ব্যক্তিগত কাউন্সেলিং · আন্তর্জাতিক উচ্চশিক্ষা"
        : "Individual counselling · International study",
    },
  ];

  return (
    <section
      aria-labelledby={`journey-heading-${locale}`}
      className={cn(
        "overflow-hidden rounded-3xl border border-slate-700 bg-[var(--brand-navy)] px-6 py-9 text-white sm:p-10 lg:p-12",
        className,
      )}
    >
      <div className="flex flex-col gap-5 border-b border-white/15 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-orange-300 uppercase">
            {isBn
              ? "অভিজ্ঞতা থেকে প্রতিষ্ঠা"
              : "Experience. Establishment. Expansion."}
          </p>
          <h3
            id={`journey-heading-${locale}`}
            className="font-heading mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {isBn
              ? "আমাদের পথচলার তিনটি অধ্যায়"
              : "The chapters of our journey"}
          </h3>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-300">
          {isBn
            ? "ঢাকা থেকেই আমাদের পুরো পথচলা। নতুন পরিচয়ে সেই অভিজ্ঞতা পৌঁছাচ্ছে আরও বেশি উচ্চশিক্ষার গন্তব্যে।"
            : "Dhaka has been our base throughout. Our new identity carries that experience into more study destinations."}
        </p>
      </div>
      <ol className="relative mt-8 grid gap-7 md:grid-cols-3 md:gap-5 lg:gap-7">
        {milestones.map((item, index) => {
          const Icon = item.icon;
          const featured = index === 1;
          return (
            <li key={item.label} className="relative flex flex-col">
              <div className="relative mb-5 flex items-center gap-3">
                {index < milestones.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-5 left-10 hidden h-px w-[calc(100%+1.75rem)] bg-white/25 md:block"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    featured
                      ? "border-orange-300 bg-[var(--brand-blue)] text-white"
                      : "border-slate-500 bg-[var(--brand-navy)] text-orange-300",
                  )}
                >
                  0{index + 1}
                </span>
                <span className="relative z-10 bg-[var(--brand-navy)] pr-3 text-xs font-medium text-slate-300">
                  {item.label}
                </span>
              </div>
              <article
                className={cn(
                  "flex flex-1 flex-col rounded-2xl border p-6 transition-transform duration-200 hover:-translate-y-1 lg:p-7",
                  featured
                    ? "border-white/90 bg-[#fffaf5] text-slate-900 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
                    : "border-white/20 bg-white/[0.06] text-white backdrop-blur-sm",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Icon
                    className={cn(
                      "size-6 stroke-[1.5]",
                      featured ? "text-[var(--brand-blue)]" : "text-orange-300",
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      featured ? "text-[var(--brand-blue)]" : "text-orange-200",
                    )}
                  >
                    {item.marker}
                  </span>
                </div>
                <h4 className="font-heading mt-6 text-xl leading-tight font-semibold tracking-tight">
                  {item.title}
                </h4>
                <p
                  className={cn(
                    "mt-3 text-sm leading-6",
                    featured ? "text-slate-600" : "text-slate-300",
                  )}
                >
                  {item.body}
                </p>
                <div
                  className={cn(
                    "mt-6 border-t pt-4",
                    featured ? "border-slate-200" : "border-white/15",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs leading-5",
                      featured ? "text-slate-600" : "text-slate-300",
                    )}
                  >
                    {item.detail}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * Illustration C — Counselling Process
 * Simplified interaction between counselor & student:
 * Reviewing academic profile, university options, documentation, and budget.
 */
export function CounsellingProcessIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#f6f5f2] p-6 sm:p-8",
        className,
      )}
    >
      <svg
        viewBox="0 0 520 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full max-w-[480px]"
        role="img"
        aria-label="Illustration of personalised counselling: reviewing student academic records, university options, and admissions plan"
      >
        <defs>
          <linearGradient id="counsellorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="orangeAccent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>
          <filter
            id="counselShadow"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="6"
              floodColor="#0F172A"
              floodOpacity="0.06"
            />
          </filter>
        </defs>

        {/* Conference / Consultation Desk Base */}
        <path
          d="M40 280 L 480 280 L 450 310 L 70 310 Z"
          fill="#F1F5F9"
          stroke="#E2E8F0"
          strokeWidth="1"
        />
        <line
          x1="40"
          y1="280"
          x2="480"
          y2="280"
          stroke="#CBD5E1"
          strokeWidth="2"
        />

        {/* Left: Counsellor Profile Node */}
        <g filter="url(#counselShadow)" transform="translate(60, 60)">
          <rect
            x="0"
            y="0"
            width="130"
            height="180"
            rx="16"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />
          {/* Avatar representation */}
          <circle
            cx="65"
            cy="46"
            r="24"
            fill="#FFF7ED"
            stroke="#FED7AA"
            strokeWidth="1.5"
          />
          <circle cx="65" cy="40" r="12" fill="url(#orangeAccent)" />
          <path d="M49 60 C 49 52, 81 52, 81 60 Z" fill="url(#orangeAccent)" />

          <rect x="25" y="86" width="80" height="7" rx="3.5" fill="#0F172A" />
          <rect x="35" y="99" width="60" height="5" rx="2.5" fill="#94A3B8" />

          {/* Dialogue Tag */}
          <rect
            x="18"
            y="125"
            width="94"
            height="26"
            rx="6"
            fill="#FFF7ED"
            stroke="#FDBA74"
            strokeWidth="1"
          />
          <text
            x="65"
            y="142"
            textAnchor="middle"
            fill="#C2410C"
            fontSize="9.5"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            Student Assessment
          </text>
        </g>

        {/* Center: The Evaluation Dashboard / Dossier */}
        <g filter="url(#counselShadow)" transform="translate(205, 40)">
          <rect
            x="0"
            y="0"
            width="150"
            height="215"
            rx="14"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* Top colored badge */}
          <path
            d="M0 14 C 0 6.2 6.2 0 14 0 L 136 0 C 143.8 0 150 6.2 150 14 L 150 32 L 0 32 Z"
            fill="url(#counsellorGrad)"
          />
          <text
            x="75"
            y="21"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            Personalised Profile File
          </text>

          {/* Academic Evaluation Lines */}
          <rect x="16" y="48" width="60" height="6" rx="3" fill="#64748B" />
          <rect x="16" y="60" width="118" height="4" rx="2" fill="#F1F5F9" />

          {/* Metrics / Match Bars */}
          <rect
            x="16"
            y="80"
            width="118"
            height="24"
            rx="6"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <text
            x="24"
            y="96"
            fill="#0F172A"
            fontSize="9"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            Budget Fit (BDT)
          </text>
          <circle cx="120" cy="92" r="5" fill="#10B981" />

          <rect
            x="16"
            y="114"
            width="118"
            height="24"
            rx="6"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <text
            x="24"
            y="130"
            fill="#0F172A"
            fontSize="9"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            Academic Match
          </text>
          <circle cx="120" cy="126" r="5" fill="#10B981" />

          <rect
            x="16"
            y="148"
            width="118"
            height="24"
            rx="6"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <text
            x="24"
            y="164"
            fill="#0F172A"
            fontSize="9"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            Scholarship Criteria
          </text>
          <circle cx="120" cy="160" r="5" fill="#F59E0B" />

          {/* Stamp */}
          <rect
            x="25"
            y="184"
            width="100"
            height="18"
            rx="4"
            fill="#ECFDF5"
            stroke="#A7F3D0"
            strokeWidth="1"
          />
          <text
            x="75"
            y="197"
            textAnchor="middle"
            fill="#059669"
            fontSize="9"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            ✓ Practical Roadmap
          </text>
        </g>

        {/* Right: Student & Family Aspirations Node */}
        <g filter="url(#counselShadow)" transform="translate(370, 75)">
          <rect
            x="0"
            y="0"
            width="120"
            height="165"
            rx="16"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />

          <circle
            cx="60"
            cy="40"
            r="22"
            fill="#F0FDF4"
            stroke="#BBF7D0"
            strokeWidth="1.5"
          />
          <circle cx="60" cy="35" r="11" fill="#059669" />
          <path d="M46 53 C 46 47, 74 47, 74 53 Z" fill="#059669" />

          <rect x="20" y="76" width="80" height="6" rx="3" fill="#0F172A" />
          <rect x="30" y="88" width="60" height="4" rx="2" fill="#94A3B8" />

          <rect
            x="14"
            y="112"
            width="92"
            height="24"
            rx="6"
            fill="#F0FDF4"
            stroke="#86EFAC"
            strokeWidth="1"
          />
          <text
            x="60"
            y="128"
            textAnchor="middle"
            fill="#15803D"
            fontSize="9"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            Student &amp; Parents
          </text>
        </g>

        {/* Dynamic Curved Interaction Bridge */}
        <path
          d="M190 120 C 200 115, 205 115, 215 120"
          stroke="#FF7A00"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
        <path
          d="M345 120 C 355 115, 360 115, 370 120"
          stroke="#10B981"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
      </svg>
    </div>
  );
}

/**
 * Minimal Leadership Avatar Placeholder
 * Clean, modern editorial avatar ready for real photo replacement via `imageSrc` prop.
 * When `imageSrc` is provided the photo is displayed; otherwise the initials gradient shows.
 */
export function LeadershipAvatar({
  name,
  role,
  initials,
  gradientClass = "from-slate-900 to-slate-800",
  imageSrc,
}: {
  name: string;
  role: string;
  initials: string;
  gradientClass?: string;
  /** When provided, renders the real portrait instead of the initials placeholder */
  imageSrc?: string;
}) {
  return (
    <div className="group relative flex flex-col items-center text-center">
      {/* Avatar Container with Subtle Outer Ring */}
      <div className="relative mb-5 flex size-28 items-center justify-center rounded-2xl border-2 border-stone-200 bg-stone-100 p-1 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-orange-500/50 group-hover:shadow-md sm:size-32">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`Portrait of ${name}`}
            className="size-full rounded-xl object-cover object-top"
          />
        ) : (
          <div
            className={cn(
              "flex size-full items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-inner",
              gradientClass,
            )}
          >
            <span className="font-heading text-2xl font-semibold tracking-wider sm:text-3xl">
              {initials}
            </span>
          </div>
        )}

        {/* Verification / Executive Pin */}
        <div className="absolute -right-2 -bottom-2 flex size-7 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-white shadow-sm">
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h4 className="font-heading text-lg font-bold tracking-tight text-slate-900">
        {name}
      </h4>
      <p className="mt-1 text-xs font-semibold tracking-wide text-orange-600 uppercase">
        {role}
      </p>
      <span className="mt-2 inline-flex items-center gap-1 text-[0.72rem] text-slate-400">
        Study Abroad Consultant
      </span>
    </div>
  );
}

