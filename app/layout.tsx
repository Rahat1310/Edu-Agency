import { ClerkProvider } from "@clerk/nextjs";
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
      <body>
        <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>
      </body>
    </html>
  );
}
