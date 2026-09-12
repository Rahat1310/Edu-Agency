import { z } from "zod";

import { programCountries } from "@/db/schema";
import { isValidYmd } from "@/lib/intakes/countdown";

export const intakeDeadlineFormSchema = z.object({
  destination: z.enum(programCountries),
  intakeLabel: z
    .string()
    .trim()
    .min(1, "Intake label is required")
    .max(80, "Intake label must be 80 characters or fewer"),
  applicationDeadline: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date")
    .refine(isValidYmd, "Enter a valid calendar date"),
});

export type IntakeDeadlineFormValues = z.infer<typeof intakeDeadlineFormSchema>;

export const intakeDeadlineIdSchema = z.object({
  id: z.string().uuid(),
});
