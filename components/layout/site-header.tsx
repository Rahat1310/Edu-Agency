"use client";

import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  Menu,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LanguageToggle } from "@/components/i18n/language-toggle";
import { HeaderAuth } from "@/components/layout/header-auth";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { getWhatsAppHref } from "@/lib/whatsapp";

function Brand({ label, locale }: { label: string; locale: Locale }) {
  return (
    <Link
      href={localizedHref("/", locale)}
      className="focus-ring group inline-flex shrink-0 items-center rounded-xl whitespace-nowrap transition-all"
      aria-label={label}
    >
      <Image
        src="/logo.png"
        alt="Study Abroad Consultancy"
        width={220}
        height={143}
        className="h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:h-13 md:h-15 lg:h-16"
        priority
      />
    </Link>
  );
}

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname() ?? "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const flyoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll listener for sticky compact header
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setActiveFlyout(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle ESC key to dismiss menus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveFlyout(null);
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleMouseEnter = (menuKey: string) => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    setActiveFlyout(menuKey);
  };

  const handleMouseLeave = () => {
    flyoutTimerRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 160);
  };

  const whatsappHref = getWhatsAppHref(dict.chrome.whatsappMessage);

  const isHomeActive =
    pathname === localizedHref("/", locale) ||
    pathname === "/" ||
    pathname === "/en" ||
    pathname === "/bn";

  const isDestinationsActive = pathname.includes("/destinations");
  const isProgramsActive = pathname.includes("/programs");
  const isToolsActive =
    pathname.includes("/cost-calculator") ||
    pathname.includes("/eligibility-quiz") ||
    pathname.includes("/success-stories");
  const isAboutActive = pathname.includes("/about");
  const isContactActive = pathname.includes("/contact");

  const destinationsList = [
    {
      slug: "china",
      flag: "🇨🇳",
      name: dict.chrome.destinationLinks.china,
      href: localizedHref("/destinations/china", locale),
      visaTag: "X1 / X2 Visa",
      accent: "hover:border-rose-300 hover:bg-rose-50/50 group/item",
      tagColor: "bg-rose-100/80 text-rose-800 border-rose-200",
      desc:
        locale === "bn"
          ? "ইঞ্জিনিয়ারিং, মেডিকেল ও সরকারি স্কলারশিপ"
          : "Top tech, engineering & high-value scholarships",
    },
    {
      slug: "india",
      flag: "🇮🇳",
      name: dict.chrome.destinationLinks.india,
      href: localizedHref("/destinations/india", locale),
      visaTag: "SII + e-Student",
      accent: "hover:border-amber-300 hover:bg-amber-50/50 group/item",
      tagColor: "bg-amber-100/80 text-amber-800 border-amber-200",
      desc:
        locale === "bn"
          ? "স্বল্প খরচ, কাছাকাছি দূরত্ব ও স্বীকৃত ক্যাম্পাস"
          : "Premier institutes, SII awards & close to home",
    },
    {
      slug: "malaysia",
      flag: "🇲🇾",
      name: dict.chrome.destinationLinks.malaysia,
      href: localizedHref("/destinations/malaysia", locale),
      visaTag: "EMGS Pass",
      accent: "hover:border-teal-300 hover:bg-teal-50/50 group/item",
      tagColor: "bg-teal-100/80 text-teal-800 border-teal-200",
      desc:
        locale === "bn"
          ? "ব্রিটিশ ও অস্ট্রেলিয়ান গ্লোবাল শাখা ক্যাম্পাস"
          : "UK & Australian branch campuses, English-taught",
    },
    {
      slug: "south-korea",
      flag: "🇰🇷",
      name: dict.chrome.destinationLinks["south-korea"],
      href: localizedHref("/destinations/south-korea", locale),
      visaTag: "D-2 / D-4 Visa",
      accent: "hover:border-indigo-300 hover:bg-indigo-50/50 group/item",
      tagColor: "bg-indigo-100/80 text-indigo-800 border-indigo-200",
      desc:
        locale === "bn"
          ? "রোবোটিক্স, এআই এবং জিকেএস স্কলারশিপ"
          : "Leading robotics, AI research & GKS funding",
    },
  ];

  return (
    <>
      {/* 🌟 Main Floating Glassmorphic Navigation Bar */}
      <header
        lang={locale}
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-stone-200/80 bg-white/95 py-2.5 shadow-[0_8px_32px_-4px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            : "border-b border-stone-200/60 bg-white/85 py-3 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)] backdrop-blur-lg"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Tagline */}
          <Brand label={dict.chrome.brandAria} locale={locale} />

          {/* 💎 Desktop Navigation Menu with Interactive Mega-Flyouts */}
          <nav
            className="hidden items-center gap-1 lg:flex xl:gap-1.5"
            aria-label={dict.chrome.navAria}
          >
            {/* 1. Home */}
            <Link
              href={localizedHref("/", locale)}
              className={`focus-ring relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.84rem] font-semibold transition-all xl:text-sm ${
                isHomeActive
                  ? "bg-orange-50 font-bold text-orange-600 shadow-2xs"
                  : "text-slate-700 hover:bg-stone-100/80 hover:text-orange-600"
              }`}
            >
              {isHomeActive && (
                <span className="size-1.5 rounded-full bg-orange-500"></span>
              )}
              <span>{dict.chrome.nav.home}</span>
            </Link>

            {/* 2. Destinations (Interactive Flyout) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("destinations")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveFlyout(
                    activeFlyout === "destinations" ? null : "destinations",
                  )
                }
                aria-expanded={activeFlyout === "destinations"}
                className={`focus-ring inline-flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-2 text-[0.84rem] font-semibold transition-all xl:text-sm ${
                  isDestinationsActive || activeFlyout === "destinations"
                    ? "bg-orange-50/90 font-bold text-orange-600"
                    : "text-slate-700 hover:bg-stone-100/80 hover:text-orange-600"
                }`}
              >
                <span>{dict.chrome.nav.destinations}</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    activeFlyout === "destinations" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Destinations Mega Menu Dropdown */}
              {activeFlyout === "destinations" && (
                <div
                  className="animate-in fade-in zoom-in-95 absolute top-[calc(100%+0.5rem)] -left-20 w-[580px] rounded-2xl border border-stone-200/90 bg-white/98 p-4.5 shadow-2xl backdrop-blur-2xl duration-150 xl:-left-12"
                  role="menu"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <div>
                      <h3 className="font-display text-xs font-bold tracking-wider text-slate-900 uppercase">
                        {locale === "bn"
                          ? "আমাদের প্রধান স্টাডি রুট"
                          : "Featured Study Destinations"}
                      </h3>
                      <p className="text-[0.72rem] text-slate-500">
                        {locale === "bn"
                          ? "ভিসা গাইডেন্স ও সরাসরি বিশ্ববিদ্যালয় পার্টনারশিপ"
                          : "Direct university admissions with end-to-end visa desk"}
                      </p>
                    </div>
                    <span className="rounded-full bg-orange-100/70 px-2 py-0.5 text-[0.65rem] font-bold text-orange-700">
                      {locale === "bn" ? "৪টি মূল রুট" : "4 Key Routes"}
                    </span>
                  </div>

                  {/* 2x2 Grid of Country Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {destinationsList.map((dest) => (
                      <Link
                        key={dest.slug}
                        href={dest.href}
                        className={`focus-ring flex flex-col gap-1 rounded-xl border border-stone-200/70 bg-stone-50/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${dest.accent}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                            <span className="text-base">{dest.flag}</span>
                            <span className="transition-colors group-hover/item:text-orange-600">
                              {dest.name}
                            </span>
                          </span>
                          <span
                            className={`rounded-full border px-1.5 py-0.5 text-[0.62rem] font-bold ${dest.tagColor}`}
                          >
                            {dest.visaTag}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-[0.72rem] text-slate-500">
                          {dest.desc}
                        </p>
                      </Link>
                    ))}
                  </div>

                  {/* Flyout Bottom Link */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-stone-100 pt-3">
                    <Link
                      href={localizedHref("/destinations", locale)}
                      className="group/all inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                    >
                      <span>
                        {locale === "bn"
                          ? "সকল গন্তব্য ও প্রি-ডিপারচার নির্দেশিকা দেখুন"
                          : "Explore all destinations & pre-departure roadmaps"}
                      </span>
                      <ArrowRight className="size-3 transition-transform group-hover/all:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Programs (Interactive Flyout) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("programs")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveFlyout(
                    activeFlyout === "programs" ? null : "programs",
                  )
                }
                aria-expanded={activeFlyout === "programs"}
                className={`focus-ring inline-flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-2 text-[0.84rem] font-semibold transition-all xl:text-sm ${
                  isProgramsActive || activeFlyout === "programs"
                    ? "bg-orange-50/90 font-bold text-orange-600"
                    : "text-slate-700 hover:bg-stone-100/80 hover:text-orange-600"
                }`}
              >
                <span>{dict.chrome.nav.programs}</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    activeFlyout === "programs" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Programs Dropdown */}
              {activeFlyout === "programs" && (
                <div
                  className="animate-in fade-in zoom-in-95 absolute top-[calc(100%+0.5rem)] left-0 w-[440px] rounded-2xl border border-stone-200/90 bg-white/98 p-4 shadow-2xl backdrop-blur-2xl duration-150"
                  role="menu"
                >
                  <div className="space-y-2">
                    <Link
                      href={localizedHref("/programs", locale)}
                      className="focus-ring group/prog flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-orange-200 hover:bg-orange-50/50"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover/prog:bg-orange-600 group-hover/prog:text-white">
                        <BookOpen className="size-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 transition-colors group-hover/prog:text-orange-600">
                            {locale === "bn"
                              ? "সকল প্রোগ্রাম ব্রাউজ করুন"
                              : "Browse All Programs"}
                          </span>
                          <span className="py-0.2 rounded-full bg-stone-100 px-1.5 text-[0.62rem] font-semibold text-slate-600">
                            500+ Degrees
                          </span>
                        </div>
                        <p className="text-[0.73rem] text-slate-500">
                          {locale === "bn"
                            ? "স্নাতক, স্নাতকোত্তর ও ডিপ্লোমা প্রোগ্রামের সম্পূর্ণ তালিকা"
                            : "Verified Bachelor, Master & Diploma courses across top universities"}
                        </p>
                      </div>
                    </Link>

                    <Link
                      href={localizedHref("/programs/compare", locale)}
                      className="focus-ring group/comp flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-sky-200 hover:bg-sky-50/50"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600 transition-colors group-hover/comp:bg-sky-600 group-hover/comp:text-white">
                        <Layers className="size-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 transition-colors group-hover/comp:text-sky-600">
                            {locale === "bn"
                              ? "প্রোগ্রাম তুলনা করুন"
                              : "Compare Programs"}
                          </span>
                          <span className="py-0.2 rounded-full bg-sky-100 px-1.5 text-[0.62rem] font-bold text-sky-700">
                            Side-by-Side
                          </span>
                        </div>
                        <p className="text-[0.73rem] text-slate-500">
                          {locale === "bn"
                            ? "টিউশন ফি, মেয়াদ ও রিকোয়ারমেন্ট পাশাপাশি তুলনা করুন"
                            : "Directly compare fees, duration, and prerequisites before applying"}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Popular Discipline Tags */}
                  <div className="mt-3 border-t border-stone-100 pt-2.5">
                    <span className="text-[0.68rem] font-bold tracking-wider text-slate-400 uppercase">
                      {locale === "bn" ? "জনপ্রিয় বিষয়:" : "Popular Fields:"}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {[
                        "Medicine / MBBS",
                        "Computer Science & AI",
                        "Engineering",
                        "Business & Finance",
                      ].map((tag) => (
                        <Link
                          key={tag}
                          href={`${localizedHref("/programs", locale)}?q=${encodeURIComponent(tag)}`}
                          className="rounded-full border border-stone-200/80 bg-stone-50 px-2 py-0.5 text-[0.68rem] font-medium text-slate-600 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Student Tools (Interactive Flyout: Cost Calculator, Eligibility, Success Stories) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("tools")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveFlyout(activeFlyout === "tools" ? null : "tools")
                }
                aria-expanded={activeFlyout === "tools"}
                className={`focus-ring inline-flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-2 text-[0.84rem] font-semibold transition-all xl:text-sm ${
                  isToolsActive || activeFlyout === "tools"
                    ? "bg-orange-50/90 font-bold text-orange-600"
                    : "text-slate-700 hover:bg-stone-100/80 hover:text-orange-600"
                }`}
              >
                <span>
                  {locale === "bn" ? "টুলস ও গাইডেন্স" : "Student Tools"}
                </span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    activeFlyout === "tools" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Tools Dropdown */}
              {activeFlyout === "tools" && (
                <div
                  className="animate-in fade-in zoom-in-95 absolute top-[calc(100%+0.5rem)] left-0 w-[450px] rounded-2xl border border-stone-200/90 bg-white/98 p-4 shadow-2xl backdrop-blur-2xl duration-150"
                  role="menu"
                >
                  <div className="space-y-2">
                    {/* Cost Calculator */}
                    <Link
                      href={localizedHref("/cost-calculator", locale)}
                      className="focus-ring group/calc flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-amber-200 hover:bg-amber-50/50"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-colors group-hover/calc:bg-amber-600 group-hover/calc:text-white">
                        <Calculator className="size-4.5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 transition-colors group-hover/calc:text-amber-700">
                          {dict.chrome.nav.costs}
                        </span>
                        <p className="text-[0.73rem] text-slate-500">
                          {locale === "bn"
                            ? "টিউশন ফি, ভিসা খরচ ও জীবনযাত্রার রিয়েল-টাইম হিসাব"
                            : "Calculate exact tuition, living costs, and BDT budget conversion"}
                        </p>
                      </div>
                    </Link>

                    {/* Eligibility Quiz */}
                    <Link
                      href={localizedHref("/eligibility-quiz", locale)}
                      className="focus-ring group/quiz flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors group-hover/quiz:bg-emerald-600 group-hover/quiz:text-white">
                        <CheckCircle2 className="size-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 transition-colors group-hover/quiz:text-emerald-700">
                            {dict.chrome.nav.eligibility}
                          </span>
                          <span className="py-0.2 rounded-full bg-emerald-100 px-1.5 text-[0.62rem] font-bold text-emerald-800">
                            {locale === "bn" ? "৩ মিনিট" : "Instant Match"}
                          </span>
                        </div>
                        <p className="text-[0.73rem] text-slate-500">
                          {locale === "bn"
                            ? "আপনার জিপিএ ও বাজেটের ভিত্তিতে সঠিক দেশ ও ইউনিভার্সিটি খুঁজুন"
                            : "Fast 3-minute check to find your admission & visa chances"}
                        </p>
                      </div>
                    </Link>

                    {/* Success Stories */}
                    <Link
                      href={localizedHref("/success-stories", locale)}
                      className="focus-ring group/story flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-purple-200 hover:bg-purple-50/50"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover/story:bg-purple-600 group-hover/story:text-white">
                        <Sparkles className="size-4.5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 transition-colors group-hover/story:text-purple-700">
                          {dict.chrome.nav.stories}
                        </span>
                        <p className="text-[0.73rem] text-slate-500">
                          {locale === "bn"
                            ? "ভিসাপ্রাপ্ত বাংলাদেশি শিক্ষার্থীদের অভিজ্ঞতা ও রিভিউ"
                            : "Real visa approvals, university journeys & student testimonials"}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 5. About */}
            <Link
              href={localizedHref("/about", locale)}
              className={`focus-ring relative inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.84rem] font-semibold transition-all xl:text-sm ${
                isAboutActive
                  ? "bg-orange-50 font-bold text-orange-600 shadow-2xs"
                  : "text-slate-700 hover:bg-stone-100/80 hover:text-orange-600"
              }`}
            >
              {isAboutActive && (
                <span className="size-1.5 rounded-full bg-orange-500"></span>
              )}
              <span>{dict.chrome.nav.about}</span>
            </Link>

            {/* 6. Contact */}
            <Link
              href={localizedHref("/contact", locale)}
              className={`focus-ring relative inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.84rem] font-semibold transition-all xl:text-sm ${
                isContactActive
                  ? "bg-orange-50 font-bold text-orange-600 shadow-2xs"
                  : "text-slate-700 hover:bg-stone-100/80 hover:text-orange-600"
              }`}
            >
              {isContactActive && (
                <span className="size-1.5 rounded-full bg-orange-500"></span>
              )}
              <span>{dict.chrome.nav.contact}</span>
            </Link>
          </nav>

          {/* 🚀 Right Action Controls (Language, CTA, Auth & Mobile Menu) */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Language Capsule Switch */}
            <LanguageToggle variant="navbar" />

            {/* High-Converting Consultation Button */}
            <Link
              href={localizedHref("/contact", locale)}
              className="btn-sunset focus-ring group hidden min-h-9.5 items-center justify-center gap-2 rounded-full px-4.5 text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] sm:inline-flex"
            >
              <CalendarCheck className="size-3.5 text-white/90" />
              <span>
                {locale === "bn" ? "পরামর্শ বুক করুন" : "Book Consultation"}
              </span>
              <ArrowRight className="size-3.5 text-white/90 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            {/* Clerk Authentication / Sign-In */}
            <HeaderAuth signInLabel={dict.chrome.signIn} />

            {/* Mobile Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="focus-ring flex size-9.5 cursor-pointer items-center justify-center rounded-full border border-stone-200 bg-white text-slate-800 shadow-2xs transition-all hover:bg-stone-50 hover:text-orange-600 active:scale-95 lg:hidden"
              aria-label={dict.chrome.openMenu}
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* 📱 Redesigned Mobile Navigation Drawer (App-like Sheet with Backdrop) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-stone-200/80 px-5">
              <Brand label={dict.chrome.brandAria} locale={locale} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="focus-ring flex size-8 cursor-pointer items-center justify-center rounded-full bg-stone-100 text-slate-700 transition-colors hover:bg-stone-200"
                aria-label="Close menu"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {/* Primary Mobile CTA Button */}
              <Link
                href={localizedHref("/contact", locale)}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-sunset flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-md"
              >
                <Sparkles className="size-4" />
                <span>
                  {locale === "bn"
                    ? "বিনামূল্যে পরামর্শ বুক করুন"
                    : "Book Free Consultation"}
                </span>
                <ArrowRight className="size-4" />
              </Link>

              {/* Destinations Section */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {dict.chrome.nav.destinations}
                  </span>
                  <Link
                    href={localizedHref("/destinations", locale)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[0.72rem] font-bold text-orange-600"
                  >
                    {locale === "bn" ? "সবগুলো →" : "View all →"}
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {destinationsList.map((dest) => (
                    <Link
                      key={dest.slug}
                      href={dest.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex flex-col gap-1 rounded-xl border border-stone-200/80 p-2.5 transition-colors ${dest.accent}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{dest.flag}</span>
                        <span className="line-clamp-1 text-xs font-bold text-slate-800">
                          {dest.name}
                        </span>
                      </div>
                      <span className="text-[0.62rem] font-medium text-slate-500">
                        {dest.visaTag}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Programs & Comparison */}
              <div>
                <span className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                  {dict.chrome.nav.programs}
                </span>
                <div className="space-y-1.5">
                  <Link
                    href={localizedHref("/programs", locale)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="focus-ring flex items-center gap-2.5 rounded-xl border border-stone-200/60 bg-stone-50/70 p-2.5 font-semibold text-slate-800 transition-colors hover:bg-orange-50 hover:text-orange-600"
                  >
                    <BookOpen className="size-4 text-orange-600" />
                    <span className="text-xs">
                      {locale === "bn"
                        ? "সকল প্রোগ্রাম ব্রাউজ করুন"
                        : "Browse All Programs (500+)"}
                    </span>
                  </Link>
                  <Link
                    href={localizedHref("/programs/compare", locale)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="focus-ring flex items-center gap-2.5 rounded-xl border border-stone-200/60 bg-stone-50/70 p-2.5 font-semibold text-slate-800 transition-colors hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Layers className="size-4 text-sky-600" />
                    <span className="text-xs">
                      {locale === "bn"
                        ? "প্রোগ্রাম তুলনা করুন"
                        : "Compare Programs Side-by-Side"}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Student Tools */}
              <div>
                <span className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                  {locale === "bn" ? "টুলস ও অ্যাসেসমেন্ট" : "Student Tools"}
                </span>
                <div className="space-y-1.5">
                  <Link
                    href={localizedHref("/cost-calculator", locale)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="focus-ring flex items-center justify-between rounded-xl border border-stone-200/60 bg-stone-50/70 p-2.5 font-semibold text-slate-800 transition-colors hover:bg-amber-50 hover:text-amber-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calculator className="size-4 text-amber-600" />
                      <span className="text-xs">{dict.chrome.nav.costs}</span>
                    </div>
                    <span className="text-[0.65rem] text-slate-500">
                      Calculator
                    </span>
                  </Link>

                  <Link
                    href={localizedHref("/eligibility-quiz", locale)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="focus-ring flex items-center justify-between rounded-xl border border-stone-200/60 bg-stone-50/70 p-2.5 font-semibold text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span className="text-xs">
                        {dict.chrome.nav.eligibility}
                      </span>
                    </div>
                    <span className="py-0.2 rounded-full bg-emerald-100 px-1.5 text-[0.62rem] font-bold text-emerald-800">
                      3 Min
                    </span>
                  </Link>

                  <Link
                    href={localizedHref("/success-stories", locale)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="focus-ring flex items-center justify-between rounded-xl border border-stone-200/60 bg-stone-50/70 p-2.5 font-semibold text-slate-800 transition-colors hover:bg-purple-50 hover:text-purple-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="size-4 text-purple-600" />
                      <span className="text-xs">{dict.chrome.nav.stories}</span>
                    </div>
                    <span className="text-[0.65rem] text-slate-500">
                      Reviews
                    </span>
                  </Link>
                </div>
              </div>

              {/* Company Links */}
              <div className="border-t border-stone-100 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={localizedHref("/about", locale)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="focus-ring flex min-h-10 items-center justify-center rounded-xl border border-stone-200/80 bg-white text-xs font-semibold text-slate-700 transition-colors hover:bg-stone-50"
                  >
                    {dict.chrome.nav.about}
                  </Link>
                  <Link
                    href={localizedHref("/contact", locale)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="focus-ring flex min-h-10 items-center justify-center rounded-xl border border-stone-200/80 bg-white text-xs font-semibold text-slate-700 transition-colors hover:bg-stone-50"
                  >
                    {dict.chrome.nav.contact}
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer with Quick WhatsApp & Auth */}
            <div className="space-y-3 border-t border-stone-200/80 bg-stone-50/80 p-4">
              <HeaderAuth mobile signInLabel={dict.chrome.signIn} />

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-800 shadow-2xs transition-colors hover:bg-emerald-100"
              >
                <MessageCircle className="size-4 text-emerald-600" />
                <span>
                  {locale === "bn"
                    ? "হোয়াটসঅ্যাপে তাৎক্ষণিক তথ্য নিন"
                    : "Direct WhatsApp Counseling"}
                </span>
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
