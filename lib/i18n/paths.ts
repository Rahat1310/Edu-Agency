import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

const MARKETING_PREFIXES = [
  "/about",
  "/contact",
  "/destinations",
  "/programs",
  "/privacy",
  "/eligibility-quiz",
  "/cost-calculator",
  "/success-stories",
] as const;

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/bn" || pathname === "/en") {
    return "/";
  }

  if (pathname.startsWith("/bn/") || pathname.startsWith("/en/")) {
    return pathname.slice(3);
  }

  return pathname;
}

export function getLocaleFromPathname(pathname: string): Locale {
  if (pathname === "/bn" || pathname.startsWith("/bn/")) {
    return "bn";
  }

  return DEFAULT_LOCALE;
}

export function localizedHref(href: string, locale: Locale): string {
  const [pathPart, queryPart] = href.split("?");
  const path = pathPart && pathPart.length > 0 ? pathPart : "/";
  const bare = stripLocalePrefix(path);
  const localized =
    locale === "bn" ? (bare === "/" ? "/bn" : `/bn${bare}`) : bare;
  return queryPart ? `${localized}?${queryPart}` : localized;
}

export function switchLocalePath(
  pathname: string,
  target: Locale,
  search = "",
): string {
  const next = localizedHref(stripLocalePrefix(pathname), target);
  if (search && search !== "?") {
    return `${next}${search.startsWith("?") ? search : `?${search}`}`;
  }
  return next;
}

export function isMarketingPath(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname);

  if (bare === "/") {
    return true;
  }

  return MARKETING_PREFIXES.some(
    (prefix) => bare === prefix || bare.startsWith(`${prefix}/`),
  );
}

export function withEnPrefix(pathname: string): string {
  if (pathname === "/") {
    return "/en";
  }

  return `/en${pathname}`;
}

export function withoutEnPrefix(pathname: string): string {
  if (pathname === "/en") {
    return "/";
  }

  if (pathname.startsWith("/en/")) {
    return pathname.slice(3);
  }

  return pathname;
}
