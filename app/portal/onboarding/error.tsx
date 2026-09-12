"use client";

import { PortalErrorState } from "@/components/portal/portal-error-state";

type PortalOnboardingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PortalOnboardingError({
  reset,
}: PortalOnboardingErrorProps) {
  return (
    <div className="mx-auto max-w-lg">
      <PortalErrorState
        title="We couldn't finish opening your file"
        body="Nothing you typed is lost. Try again, or WhatsApp us and we'll match you from our side."
        onRetry={reset}
      />
    </div>
  );
}
