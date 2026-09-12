import { inngest } from "@/lib/inngest/client";
import { findDueNurture, sendDueNurture } from "@/lib/nurture/run";

/** 10:00 Asia/Dhaka daily — after intake reminders at 09:00. */
export const NURTURE_CRON = "TZ=Asia/Dhaka 0 10 * * *";

export const NURTURE_EVENT = "nurture/leads.run";

export const leadNurture = inngest.createFunction(
  {
    id: "lead-nurture",
    name: "Lead nurture sequence",
    description:
      "Daily batch of WhatsApp/email follow-ups for idle new/contacted leads. Does not poll Neon between runs.",
    triggers: [{ cron: NURTURE_CRON }, { event: NURTURE_EVENT }],
    singleton: { mode: "skip" },
  },
  async ({ step }) => {
    const due = await step.run("find-due-nurture", async () => {
      return findDueNurture();
    });

    return step.run("send-and-record", async () => {
      return sendDueNurture(due);
    });
  },
);
