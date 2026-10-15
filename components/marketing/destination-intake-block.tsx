"use client";
import { MarketingEmptyState } from "@/components/marketing/empty-state";
import { IntakeCountdown } from "@/components/marketing/intake-countdown";
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
  const copy = dict.intakeCountdown;
  const empty = (
    <MarketingEmptyState
      title={copy.emptyTitle}
      body={copy.empty.replace("{destination}", destinationName)}
    />
  );
  const body =
    !countdown || countdown.daysRemaining < 0 ? (
      empty
    ) : (
      <IntakeCountdown
        countdown={countdown}
        destinationName={destinationName}
        dict={dict}
      />
    );
  return <div className={cn("space-y-3", className)}>{body}</div>;
}
