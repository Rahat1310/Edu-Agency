/**
 * Public origin for canonical URLs, Open Graph, sitemap, and robots.
 * Does not import `lib/env` — those boot vars are not required here.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path === "/" || path === "") {
    return base;
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
