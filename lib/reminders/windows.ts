/** Default calendar-day windows (Dhaka) for intake-deadline reminders. */
export const DEFAULT_INTAKE_REMINDER_WINDOWS = [14, 7, 2] as const;

/** SMS only when the matched window is within this many calendar days. */
export const SMS_REMINDER_MAX_DAYS = 2;

export function parseReminderWindows(raw: string | undefined): number[] {
  if (raw === undefined || raw.trim().length === 0) {
    return [...DEFAULT_INTAKE_REMINDER_WINDOWS];
  }

  const parsed: number[] = [];
  const seen = new Set<number>();

  for (const token of raw.split(",")) {
    const value = Number(token.trim());
    if (!Number.isInteger(value) || value < 0 || seen.has(value)) {
      continue;
    }
    seen.add(value);
    parsed.push(value);
  }

  return parsed.length > 0 ? parsed : [...DEFAULT_INTAKE_REMINDER_WINDOWS];
}

export function reminderWindowsFromEnv(): number[] {
  return parseReminderWindows(process.env.INTAKE_REMINDER_WINDOWS);
}

export function maxReminderWindow(windows: readonly number[]): number {
  if (windows.length === 0) {
    return Math.max(...DEFAULT_INTAKE_REMINDER_WINDOWS);
  }

  return Math.max(...windows);
}

export function shouldSendSms(daysRemaining: number): boolean {
  return daysRemaining >= 0 && daysRemaining <= SMS_REMINDER_MAX_DAYS;
}
