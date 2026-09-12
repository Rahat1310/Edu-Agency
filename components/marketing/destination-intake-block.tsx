"use client";

import { MarketingEmptyState } from "@/components/marketing/empty-state";
import { MarketingErrorState } from "@/components/marketing/error-state";
import { IntakeCountdown } from "@/components/marketing/intake-countdown";
import {
  MarketingPreviewBar,
  useMarketingPreview,
} from "@/components/marketing/preview";
import { DestinationCountdownSkeleton } from "@/components/marketing/skeleton";
import type { Dictionary } from "@/lib/i18n/types";
import type { UpcomingIntakeCountdown } from "@/lib/intakes/countdown";
import { cn } from "@/lib/utils";

type DestinationIntakeBlockProps = {
  countdown: UpcomingIntakeCountdown | null | undefined;
  destinationName: string;
  dict: Dictionary;
  className?: string;
};

export function DestinationIntakeBlock({
  countdown,
  destinationName,
  dict,
  className,
}: DestinationIntakeBlockProps) {
  const { preview, setPreview } = useMarketingPreview();
  const copy = dict.intakeCountdown;

  const empty = (
    <MarketingEmptyState
      title={copy.emptyTitle}
      body={copy.empty.replace("{destination}", destinationName)}
    />
  );

  const loading = <DestinationCountdownSkeleton label={copy.loadingAria} />;

  const error = (
    <MarketingErrorState
      title={copy.errorTitle}
      body={copy.errorBody}
      retryLabel={dict.common.tryAgain}
      onRetry={() => setPreview("off")}
    />
  );

  const body =
    preview === "loading"
      ? loading
      : preview === "error"
        ? error
        : preview === "empty" || !countdown || countdown.daysRemaining < 0
          ? empty
          : (
              <IntakeCountdown
                countdown={countdown}
                destinationName={destinationName}
                dict={dict}
              />
            );

  return (
    <div className={cn("space-y-3", className)}>
      <MarketingPreviewBar preview={preview} onChange={setPreview} />
      {body}
    </div>
  );
}
