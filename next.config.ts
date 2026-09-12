import type { NextConfig } from "next";

import { getSecurityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
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

export default nextConfig;
