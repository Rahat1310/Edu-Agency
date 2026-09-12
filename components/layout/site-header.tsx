"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { LanguageToggle } from "@/components/i18n/language-toggle";
import { HeaderAuth } from "@/components/layout/header-auth";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";

function Brand({ label, locale }: { label: string; locale: Locale }) {
  return (
    <Link
      href={localizedHref("/", locale)}
      className="focus-ring group inline-flex shrink-0 items-center rounded-xl whitespace-nowrap transition-all"
      aria-label={label}
    >
      {locale === "bn" ? (
        <div className="flex shrink-0 flex-col leading-tight select-none">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-xs font-black text-white shadow-xs">
              স্টা
            </span>
            <span className="font-display text-base font-black tracking-tight text-slate-900 sm:text-lg">
              স্টাডি অ্যাব্রড{" "}
              <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                কনসালটেন্সি
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 flex-col leading-tight select-none">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-[0.68rem] font-black tracking-tighter text-white shadow-xs">
              SAC
            </span>
            <span className="font-display text-base font-black tracking-tight text-slate-900 sm:text-lg">
              Study Abroad{" "}
              <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Consultancy
              </span>
            </span>
          </div>
        </div>
      )}
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { label: dict.chrome.nav.home, href: localizedHref("/", locale) },
    {
      label: dict.chrome.nav.destinations,
      href: localizedHref("/destinations", locale),
    },
    {
      label: dict.chrome.nav.programs,
      href: localizedHref("/programs", locale),
    },
    {
      label: dict.chrome.nav.costs,
      href: localizedHref("/cost-calculator", locale),
    },
    {
      label: dict.chrome.nav.stories,
      href: localizedHref("/success-stories", locale),
    },
    { label: dict.chrome.nav.about, href: localizedHref("/about", locale) },
    {
      label: dict.chrome.nav.eligibility,
      href: localizedHref("/eligibility-quiz", locale),
    },
    { label: dict.chrome.nav.contact, href: localizedHref("/contact", locale) },
  ] as const;

  return (
    <header
      lang={locale}
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "border-stone-200/80 bg-white/95 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xl"
          : "border-stone-200/60 bg-white/90 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:gap-6">
        <Brand label={dict.chrome.brandAria} locale={locale} />

        {/* Center Navigation Links */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label={dict.chrome.navAria}
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded-full px-3 py-1.5 text-[0.84rem] font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600 xl:px-3.5 xl:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <LanguageToggle variant="light" />

          <Link
            href={localizedHref("/contact", locale)}
            className="btn-sunset focus-ring hidden min-h-9 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold shadow-xs hover:scale-[1.02] active:scale-[0.98] sm:inline-flex"
          >
            <span>
              {locale === "bn" ? "পরামর্শ বুক করুন →" : "Book Consultation →"}
            </span>
          </Link>

          <HeaderAuth signInLabel={dict.chrome.signIn} />

          {/* Mobile Drawer Trigger */}
          <details className="group relative lg:hidden">
            <summary className="focus-ring flex size-9 cursor-pointer list-none items-center justify-center rounded-full border border-stone-200 bg-white text-slate-800 shadow-2xs transition-colors hover:bg-stone-50 [&::-webkit-details-marker]:hidden">
              <Menu className="size-4" aria-hidden="true" />
              <span className="sr-only">{dict.chrome.openMenu}</span>
            </summary>
            <nav
              className="glass-panel absolute top-[calc(100%+0.75rem)] right-0 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-2xl"
              aria-label={dict.chrome.mobileNavAria}
            >
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="focus-ring flex min-h-10 items-center rounded-xl px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50 hover:text-orange-600"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 border-t border-stone-200 pt-3">
                <HeaderAuth mobile signInLabel={dict.chrome.signIn} />
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
