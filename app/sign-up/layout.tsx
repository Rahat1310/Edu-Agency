import type { Metadata } from "next";

import { SiteLayout } from "@/components/layout/site-layout";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Create account — Study Abroad Consultant",
  description:
    "Create your student account to start your study abroad application.",
};

export default function SignUpLayout({
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
