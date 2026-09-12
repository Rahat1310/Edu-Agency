import { SiteLayout } from "@/components/layout/site-layout";
import { getDictionary } from "@/lib/i18n/get-dictionary";

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
