import type { Metadata } from "next";

import { SiteLayout } from "@/components/layout/site-layout";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Sign in — Study Abroad Consultant",
  description: "Sign in to your student or counsellor portal.",
};

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SiteLayout locale="en" dict={getDictionary("en")}>
      {children}
    </SiteLayout>
  );
}
