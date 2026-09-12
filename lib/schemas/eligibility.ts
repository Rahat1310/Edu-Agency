import { z } from "zod";

import {
  budgetBands,
  educationLevels,
  eligibilityDestinations,
} from "@/lib/eligibility";
import { HONEYPOT_FIELD } from "@/lib/schemas/lead";

const optionalScore = (max: number, label: string) =>
  z
    .union([
      z.literal(""),
      z.undefined(),
      z.null(),
      z.coerce
        .number()
        .min(0, `${label} is too low`)
        .max(max, `${label} is too high`),
    ])
    .transform((value) => (typeof value === "number" ? value : undefined));

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Enter a phone number we can reach")
  .max(30, "Phone number is too long")
  .regex(/^[+\d][\d\s()-]{6,29}$/, "Enter a valid phone number");

const optionalPhoneSchema = z
  .union([z.literal(""), phoneSchema])
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalEmailSchema = z
  .union([
    z.literal(""),
    z.string().trim().email("Enter a valid email address"),
  ])
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

/**
 * Quiz answers only — shared by the form and the scoring function.
 */
export const eligibilityAnswersSchema = z.object({
  educationLevel: z.enum(educationLevels, {
    error: "Choose your current education level",
  }),
  destination: z.enum(eligibilityDestinations, {
    error: "Choose a destination",
  }),
  ielts: optionalScore(9, "IELTS"),
  toefl: optionalScore(120, "TOEFL"),
  hsk: optionalScore(6, "HSK"),
  topik: optionalScore(6, "TOPIK"),
  budget: z.enum(budgetBands, {
    error: "Choose a budget range",
  }),
});

export const eligibilitySubmissionSchema = eligibilityAnswersSchema.extend({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema,
  email: optionalEmailSchema,
  consent: z.boolean().refine((value) => value === true, {
    error: "Consent is required before we can store this result",
  }),
  turnstileToken: z
    .string()
    .trim()
    .min(1, "Confirm you are not a robot before sending"),
});

export const eligibilityClientSchema = eligibilitySubmissionSchema.extend({
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type EligibilityAnswersValues = z.infer<typeof eligibilityAnswersSchema>;
export type EligibilitySubmissionValues = z.infer<
  typeof eligibilitySubmissionSchema
>;
