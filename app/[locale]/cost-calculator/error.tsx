"use client";

import { PageShell } from "@/components/layout/page-shell";
import { MarketingErrorState } from "@/components/marketing/error-state";
import { useDictionary } from "@/lib/i18n/use-locale";

type CostCalculatorErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CostCalculatorError({
  reset,
}: CostCalculatorErrorProps) {
  const dict = useDictionary();

  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <MarketingErrorState
          title={dict.costCalculator.errorTitle}
          body={dict.costCalculator.errorBody}
          retryLabel={dict.common.tryAgain}
          onRetry={reset}
        />
      </PageShell>
    </section>
  );
}
