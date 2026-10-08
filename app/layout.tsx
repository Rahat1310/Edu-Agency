import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import type { Metadata } from "next";
import {
  Anek_Bangla,
  Noto_Sans_Bengali,
  Plus_Jakarta_Sans,
  Inter,
} from "next/font/google";

import { clerkAppearance } from "@/lib/clerk-appearance";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

import "./globals.css";

// Premium English Display Font
const displayFontEn = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display-en",
  display: "swap",
});

// Premium English Body Font
const bodyFontEn = Inter({
  subsets: ["latin"],
  variable: "--font-sans-en",
  display: "swap",
});

// Bengali Display Font
const displayFontBn = Anek_Bangla({
  subsets: ["bengali"],
  variable: "--font-display-bn",
  display: "swap",
});

// Bengali Body Font
const bodyFontBn = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-sans-bn",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Study Abroad Consultancy — four study routes from Bangladesh",
  description:
    "Dhaka-based guidance for Bangladeshi students applying to China, India, Malaysia, and South Korea.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }, { url: "/favicon.ico" }],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    siteName: "Study Abroad Consultancy",
    images: [
      {
        url: "/logo.png",
        width: 1089,
        height: 708,
        alt: "Study Abroad Consultancy Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        displayFontEn.variable,
        bodyFontEn.variable,
        displayFontBn.variable,
        bodyFontBn.variable,
      )}
    >
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-5KFVN2TG');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5KFVN2TG"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
