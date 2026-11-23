import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

import { getSecurityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  // Canonicalize external English URLs before middleware rewrites them to /en.
  // Doing both operations in middleware can re-enter the redirect on a rewrite.
  async redirects() {
    return [{ source: "/en/:path*", destination: "/:path*", permanent: false }];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/en" },
        {
          source:
            "/:section(about|contact|consultation|destinations|programs|privacy|eligibility-quiz|cost-calculator|success-stories)/:path*",
          destination: "/en/:section/:path*",
        },
      ],
    };
  },
  outputFileTracingExcludes: { "*": ["./imports/**/*"] },
  serverExternalPackages: [
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "inngest",
    "resend",
  ],
  async headers() {
    const headers = getSecurityHeaders();

    return [
      {
        source: "/",
        headers,
      },
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default function config(phase: string): NextConfig {
  return {
    ...nextConfig,
    // Production builds must not overwrite a running development server's files.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  };
}
