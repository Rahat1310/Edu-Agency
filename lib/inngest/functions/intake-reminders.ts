import { inngest } from "@/lib/inngest/client";
import { findDueReminders, sendDueReminders } from "@/lib/reminders/run";

/** 09:00 Asia/Dhaka daily — Bangladesh has no DST. */
export const INTAKE_REMINDER_CRON = "TZ=Asia/Dhaka 0 9 * * *";

export const INTAKE_REMINDER_EVENT = "reminders/intake.run";

export const intakeDeadlineReminders = inngest.createFunction(
  {
    id: "intake-deadline-reminders",
    name: "Intake deadline reminders",
    description:
      "Daily batch of intake-deadline email/SMS reminders. Does not poll Neon between runs.",
    triggers: [
      { cron: INTAKE_REMINDER_CRON },
      { event: INTAKE_REMINDER_EVENT },
    ],
    singleton: { mode: "skip" },
  },
  async ({ step }) => {
    const due = await step.run("find-due-reminders", async () => {
      return findDueReminders();
    });

    return step.run("send-and-record", async () => {
      return sendDueReminders(due);
    });
  },
);
