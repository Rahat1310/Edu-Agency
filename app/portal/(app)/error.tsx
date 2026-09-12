"use client";

import { PortalErrorState } from "@/components/portal/portal-error-state";

type PortalAppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PortalAppError({ reset }: PortalAppErrorProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <PortalErrorState
        title="We couldn't open your file"
        body="Your papers are still here. Try again, or WhatsApp us if this keeps happening."
        onRetry={reset}
      />
    </div>
  );
}
