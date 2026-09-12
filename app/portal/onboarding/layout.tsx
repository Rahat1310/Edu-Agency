import { OnboardingChrome } from "@/components/portal/onboarding-chrome";

export default function PortalOnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OnboardingChrome>{children}</OnboardingChrome>;
}
