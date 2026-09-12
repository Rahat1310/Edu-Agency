import "server-only";

import { sendTransactionalEmail } from "@/lib/email/send";
import { calendarDateInTimeZone } from "@/lib/intakes/countdown";
import { sendAndRecord } from "@/lib/reminders/dispatch";
import {
  loadReminderBatch,
  loadSentReminderKeys,
  recordReminderSent,
} from "@/lib/reminders/load";
import { matchDueReminders, type DueReminder } from "@/lib/reminders/match";
import {
  maxReminderWindow,
  reminderWindowsFromEnv,
} from "@/lib/reminders/windows";
import { shiftYmd } from "@/lib/reminders/ymd";
import { sendSms } from "@/lib/sms/send";

export async function findDueReminders(
  now = new Date(),
): Promise<DueReminder[]> {
  const windows = reminderWindowsFromEnv();
  const todayYmd = calendarDateInTimeZone(now);
  const latestYmd = shiftYmd(todayYmd, maxReminderWindow(windows));
  const { candidates, deadlines } = await loadReminderBatch(
    todayYmd,
    latestYmd,
  );

  return matchDueReminders(candidates, deadlines, windows, todayYmd);
}

export async function sendDueReminders(due: readonly DueReminder[]) {
  return sendAndRecord(due, {
    loadSentKeys: loadSentReminderKeys,
    recordSent: recordReminderSent,
    sendEmail: sendTransactionalEmail,
    sendSms,
  });
}

/** Same batched run the cron uses — safe to invoke from a local script. */
export async function runIntakeDeadlineReminders(now = new Date()) {
  const due = await findDueReminders(now);
  return sendDueReminders(due);
}
