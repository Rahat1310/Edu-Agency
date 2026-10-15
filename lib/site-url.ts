/**
 * Public origin for canonical URLs, Open Graph, sitemap, and robots.
 * Does not import `lib/env` — those boot vars are not required here.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  // Keep share images and canonical URLs on the public domain even when the
  // deployment provider supplies a temporary deployment hostname.
  return "https://www.studyabroadconsultantbd.com";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path === "/" || path === "") {
    return base;
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
