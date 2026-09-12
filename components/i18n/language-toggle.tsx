"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { LOCALES } from "@/lib/i18n/config";
import { useDictionary, useLocale } from "@/lib/i18n/use-locale";
import { isMarketingPath, switchLocalePath } from "@/lib/i18n/paths";

function ToggleLinks({
  search = "",
  variant = "dark",
}: {
  search?: string;
  variant?: "dark" | "light";
}) {
  const pathname = usePathname() ?? "/";
  const locale = useLocale();
  const dict = useDictionary();
  const bareIsMarketing = isMarketingPath(pathname);

  const containerClass =
    variant === "light"
      ? "inline-flex items-center gap-0.5 rounded-full border border-[var(--border)]/80 bg-[var(--brand-sky)]/80 p-0.5 shadow-2xs"
      : "inline-flex items-center gap-0.5 rounded-full bg-white/10 p-0.5";

  return (
    <div
      className={containerClass}
      role="group"
      aria-label={dict.chrome.languageAria}
    >
      {LOCALES.map((code) => {
        const href = bareIsMarketing
          ? switchLocalePath(pathname, code, search)
          : code === "bn"
            ? "/bn"
            : "/";
        const current = locale === code;
        const label = code === "en" ? dict.chrome.languageEn : dict.chrome.languageBn;

        let buttonClass = "";
        if (variant === "light") {
          buttonClass = current
            ? "focus-ring rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[var(--brand-navy)] shadow-xs"
            : "focus-ring rounded-full px-2.5 py-1 text-[0.68rem] font-semibold text-[var(--brand-ink)]/65 hover:text-[var(--brand-blue)]";
        } else {
          buttonClass = current
            ? "focus-ring-dark min-h-9 rounded-full bg-white px-2.5 text-[0.68rem] font-bold text-[var(--brand-navy)]"
            : "focus-ring-dark min-h-9 rounded-full px-2.5 text-[0.68rem] font-semibold text-white/80 hover:text-white";
        }

        return (
          <Link
            key={code}
            href={href}
            hrefLang={code}
            lang={code}
            aria-current={current ? "true" : undefined}
            className={buttonClass}
          >
            <span className={variant === "light" ? "inline-flex items-center leading-none" : "inline-flex min-h-9 items-center"}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function ToggleWithSearch({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return <ToggleLinks search={search ? `?${search}` : ""} variant={variant} />;
}

export function LanguageToggle({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <Suspense fallback={<ToggleLinks variant={variant} />}>
      <ToggleWithSearch variant={variant} />
    </Suspense>
  );
}
