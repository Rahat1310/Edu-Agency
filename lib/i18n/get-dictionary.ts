import { bn } from "@/lib/i18n/bn";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/en";
import type { Dictionary } from "@/lib/i18n/types";

const dictionaries: Record<Locale, Dictionary> = {
  en,
  bn,
};

export function getDictionary(locale: string): Dictionary {
  if (isLocale(locale)) {
    return dictionaries[locale];
  }

  return dictionaries[DEFAULT_LOCALE];
}

export function languageAlternates(barePath: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const enPath = barePath === "/" ? "/" : barePath;
  const bnPath = barePath === "/" ? "/bn" : `/bn${barePath}`;

  return {
    canonical: enPath,
    languages: {
      en: enPath,
      bn: bnPath,
      "x-default": enPath,
    },
  };
}
