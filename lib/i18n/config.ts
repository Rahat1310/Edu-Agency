/**
 * Marketing i18n uses locale routing, not a client-side dictionary swap.
 *
 * - English (default) stays on unprefixed URLs: `/`, `/about`, `/contact`,
 *   `/destinations/china`, …
 * - Bengali is served at the `/bn` prefix: `/bn`, `/bn/about`, …
 * - Middleware rewrites unprefixed marketing paths to `/en/...` so both
 *   locales are statically generated from `app/[locale]`.
 * - `/en/...` redirects back to the unprefixed canonical URL.
 * - The header toggle is a pair of links to the same path in the other
 *   locale. No client-side data fetching.
 */
export const LOCALES = ["en", "bn"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value);
}
