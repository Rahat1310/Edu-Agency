import type { Dictionary } from "@/lib/i18n/types";
import {
  formatIntakeCountdown,
  type UpcomingIntakeCountdown,
} from "@/lib/intakes/countdown";
import { cn } from "@/lib/utils";

type IntakeCountdownProps = {
  countdown: UpcomingIntakeCountdown | null | undefined;
  destinationName: string;
  dict: Dictionary;
  compact?: boolean;
  className?: string;
};

export function IntakeCountdown({
  countdown,
  destinationName,
  dict,
  compact = false,
  className,
}: IntakeCountdownProps) {
  if (!countdown || countdown.daysRemaining < 0) {
    return null;
  }

  const message = formatIntakeCountdown(dict.intakeCountdown, {
    destination: destinationName,
    intake: countdown.intakeLabel,
    daysRemaining: countdown.daysRemaining,
  });

  if (compact) {
    return (
      <span className={cn("block text-xs leading-5", className)}>
        {message}
      </span>
    );
  }

  return (
    <aside
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-white px-5 py-4",
        className,
      )}
    >
      <p className="font-display text-xl font-bold tracking-[-0.03em] text-[var(--brand-navy)]">
        {message}
      </p>
      <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
        {dict.intakeCountdown.placeholderNote}
      </p>
    </aside>
  );
}
