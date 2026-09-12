import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  isMarketingPath,
  withEnPrefix,
  withoutEnPrefix,
} from "@/lib/i18n/paths";
import { applySecurityHeaders } from "@/lib/security-headers";

const PUBLIC_EXACT_ROUTES = new Set(["/", "/en", "/bn"]);

const PUBLIC_PREFIXES = [
  "/en",
  "/bn",
  "/destinations",
  "/programs",
  "/about",
  "/contact",
  "/privacy",
  "/eligibility-quiz",
  "/cost-calculator",
  "/success-stories",
  "/sign-in",
  "/sign-up",
  "/api/webhooks",
  "/api/leads",
  "/api/eligibility-quiz",
  "/api/chat",
  "/api/inngest",
] as const;

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_EXACT_ROUTES.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

const runClerk = clerkMiddleware(async (auth) => {
  await auth.protect();
});

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const { pathname } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = withoutEnPrefix(pathname);
    const response = NextResponse.redirect(url);
    applySecurityHeaders(response);
    return response;
  }

  if (!pathname.startsWith("/bn") && isMarketingPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = withEnPrefix(pathname);
    const response = NextResponse.rewrite(url);
    applySecurityHeaders(response);
    return response;
  }

  let response: Response = NextResponse.next();

  if (!isPublicRoute(pathname)) {
    try {
      const result = await runClerk(request, event);
      if (result) {
        response = result;
      }
    } catch {
      response = NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 },
      );
    }
  }

  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
