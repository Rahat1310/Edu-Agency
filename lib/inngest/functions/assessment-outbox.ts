import { inngest } from "@/lib/inngest/client";
import { processAssessmentOutbox } from "@/lib/consultation/notifications";
export const assessmentNotifications = inngest.createFunction(
  {
    id: "assessment-notifications",
    triggers: [{ cron: "*/2 * * * *" }],
    singleton: { mode: "skip" },
  },
  async ({ step }) =>
    step.run("deliver-outbox", () => processAssessmentOutbox()),
);
