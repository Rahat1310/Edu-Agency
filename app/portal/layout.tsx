import { OnboardingChrome } from "@/components/portal/onboarding-chrome";
import { PortalProviders } from "@/components/portal/portal-providers";
import { PortalProvisioning } from "@/components/portal/portal-states";
import { getSessionUser, requireRole } from "@/lib/auth-helpers";

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId, user } = await getSessionUser();

  if (userId && !user) {
    return (
      <div data-surface="portal" className="min-h-svh font-sans">
        <PortalProviders>
          <OnboardingChrome>
            <PortalProvisioning />
          </OnboardingChrome>
        </PortalProviders>
      </div>
    );
  }

  await requireRole("student");

  // Unlinked students are sent to /portal/onboarding from (app)/layout —
  // that check cannot live here or onboarding would redirect to itself.

  return (
    <div data-surface="portal" className="min-h-svh font-sans">
      <PortalProviders>{children}</PortalProviders>
    </div>
  );
}
