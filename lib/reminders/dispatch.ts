import type { SendEmailResult } from "@/lib/email/send";
import { intakeReminderEmail, intakeReminderSms } from "@/lib/reminders/copy";
import type { DueReminder } from "@/lib/reminders/match";
import { reminderKey } from "@/lib/reminders/match";
import { shouldSendSms } from "@/lib/reminders/windows";
import type { SendSmsResult } from "@/lib/sms/send";

export type ReminderDispatchDeps = {
  loadSentKeys: (due: readonly DueReminder[]) => Promise<Set<string>>;
  recordSent: (item: DueReminder) => Promise<void>;
  sendEmail: (input: {
    to: string;
    subject: string;
    text: string;
    idempotencyKey?: string;
  }) => Promise<SendEmailResult>;
  sendSms: (input: { to: string; message: string }) => Promise<SendSmsResult>;
};

export type ReminderDispatchResult = {
  due: number;
  sent: number;
  skipped: number;
  emails: number;
  sms: number;
};

/**
 * Send due reminders once, then log `reminders_sent`. Re-query sent keys
 * before sending so an Inngest step retry never double-delivers.
 */
export async function sendAndRecord(
  due: readonly DueReminder[],
  deps: ReminderDispatchDeps,
): Promise<ReminderDispatchResult> {
  const sentKeys = await deps.loadSentKeys(due);
  const remaining = due.filter((item) => !sentKeys.has(reminderKey(item)));

  let emails = 0;
  let sms = 0;

  for (const item of remaining) {
    const copyInput = {
      studentName: item.studentName,
      destination: item.destination,
      intakeLabel: item.intakeLabel,
      applicationDeadline: item.applicationDeadline,
      daysRemaining: item.daysRemaining,
    };

    if (item.email) {
      const email = intakeReminderEmail(copyInput);
      await deps.sendEmail({
        to: item.email,
        subject: email.subject,
        text: email.text,
        idempotencyKey: `intake-reminder:${reminderKey(item)}`,
      });
      emails += 1;
    }

    if (shouldSendSms(item.daysRemaining) && item.phone.trim().length > 0) {
      try {
        await deps.sendSms({
          to: item.phone,
          message: intakeReminderSms(copyInput),
        });
        sms += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown SMS error";
        console.error("[reminders] SMS failed after email; logging sent row", {
          applicationId: item.applicationId,
          deadlineId: item.deadlineId,
          window: item.window,
          message,
        });
      }
    }

    await deps.recordSent(item);
  }

  return {
    due: due.length,
    sent: remaining.length,
    skipped: due.length - remaining.length,
    emails,
    sms,
  };
}
