import { assessmentNotifications } from "@/lib/inngest/functions/assessment-outbox";

import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import { intakeDeadlineReminders } from "@/lib/inngest/functions/intake-reminders";
import { leadNurture } from "@/lib/inngest/functions/lead-nurture";

export const runtime = "nodejs";
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [assessmentNotifications, intakeDeadlineReminders, leadNurture],
});
