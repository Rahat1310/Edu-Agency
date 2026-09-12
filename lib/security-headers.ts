/**
 * Clerk FAPI host for this instance, if set. Otherwise the documented Clerk
 * host patterns cover development (`*.clerk.accounts.dev`) and production
 * (`*.clerk.com`) Frontend API hostnames.
 *
 * @see https://clerk.com/docs/guides/secure/best-practices/csp-headers
 */
function clerkFrontendApiSources(): string[] {
  const sources = new Set<string>([
    "https://*.clerk.accounts.dev",
    "https://*.clerk.com",
    "https://clerk.accounts.dev",
    "https://clerk.com",
  ]);

  const fromEnv =
    process.env.NEXT_PUBLIC_CLERK_FRONTEND_API ??
    process.env.CLERK_FRONTEND_API;

  if (fromEnv && fromEnv.trim().length > 0) {
    try {
      const raw = fromEnv.trim();
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      sources.add(url.origin);
    } catch {
      // Ignore a malformed host
    }
  }

  return Array.from(sources);
}

function extraImgSources(): string[] {
  const sources = ["https://*.r2.dev"];
  const base =
    process.env.R2_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim();

  if (base) {
    try {
      const url = new URL(base.includes("://") ? base : `https://${base}`);
      sources.push(`${url.protocol}//${url.host}`);
    } catch {
      // Ignore a malformed public-asset origin rather than breaking CSP.
    }
  }

  return sources;
}

/**
 * Minimum CSP: `default-src 'self'` plus origins Clerk and Cloudflare
 * Turnstile document as required.
 *
 * Clerk: https://clerk.com/docs/guides/secure/best-practices/csp-headers
 * Turnstile: https://developers.cloudflare.com/turnstile/reference/content-security-policy/
 * Turnstile connect-src: https://developers.cloudflare.com/turnstile/concepts/widget/
 */
function contentSecurityPolicy(): string {
  const clerkFapi = clerkFrontendApiSources();
  const isDev = process.env.NODE_ENV !== "production";

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    isDev ? "'unsafe-eval'" : undefined,
    ...clerkFapi,
    "https://challenges.cloudflare.com",
    "https://*.protect.clerk.com",
  ].filter((value): value is string => Boolean(value));

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    `connect-src 'self' ${clerkFapi.join(" ")} https://*.protect.clerk.com https://challenges.cloudflare.com https://*.r2.cloudflarestorage.com`,
    `img-src 'self' https://img.clerk.com ${extraImgSources().join(" ")}`,
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline'",
    "frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
  ].join("; ");
}

export type SecurityHeader = {
  key: string;
  value: string;
};

export function getSecurityHeaders(): SecurityHeader[] {
  return [
    {
      key: "Content-Security-Policy",
      value: contentSecurityPolicy(),
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    {
      key: "X-Frame-Options",
      value: "SAMEORIGIN",
    },
  ];
}

export function applySecurityHeaders(response: Response): Response {
  for (const header of getSecurityHeaders()) {
    response.headers.set(header.key, header.value);
  }

  return response;
}
