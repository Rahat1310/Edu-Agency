import { z } from "zod";

import { visaApplicationSubStatuses } from "@/db/schema";

function optionalInstant(message: string) {
  return z
    .string()
    .optional()
    .transform((value, ctx) => {
      const trimmed = value?.trim() ?? "";
      if (!trimmed) {
        return null;
      }

      const date = new Date(trimmed);
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }

      return date;
    });
}

export const updateVisaApplicationSchema = z.object({
  leadId: z.string().uuid(),
  subStatus: z.enum(visaApplicationSubStatuses),
  referenceNumber: z
    .string()
    .trim()
    .max(80, "Keep the reference number under 80 characters")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  submittedAt: optionalInstant("Enter a valid submitted date"),
  decidedAt: optionalInstant("Enter a valid decision date"),
  notes: z
    .string()
    .trim()
    .max(4000, "Keep notes under 4,000 characters")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

export type UpdateVisaApplicationInput = z.infer<
  typeof updateVisaApplicationSchema
>;

export const visaApplicationLeadIdSchema = z.object({
  leadId: z.string().uuid(),
});
