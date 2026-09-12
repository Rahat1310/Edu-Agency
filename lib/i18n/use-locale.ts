"use client";

import { usePathname } from "next/navigation";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocaleFromPathname } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";

export function useLocale(): Locale {
  const pathname = usePathname();
  return pathname ? getLocaleFromPathname(pathname) : DEFAULT_LOCALE;
}

export function useDictionary(): Dictionary {
  return getDictionary(useLocale());
}
