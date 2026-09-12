import { z } from "zod";

import { leadDestinationInterests, leadStatuses } from "@/db/schema";

export const leadDestinationInterestValues = leadDestinationInterests;

export const leadSources = [
  "website",
  "contact",
  "home-cta",
  "eligibility-quiz",
  "chatbot",
] as const;

export const LEAD_SOURCE_SELF_SIGNUP = "self-signup";

export const HONEYPOT_FIELD = "companyUrl";

const optionalMessageSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const phoneSchema = z
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
 * Shared lead-form schema — imported by the public form and the API route.
 * `status` and `source` are not trusted from the client; new rows are
 * always `new`, and source is allowlisted server-side.
 */
export const leadFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema,
  email: optionalEmailSchema,
  destinationInterest: z.enum(leadDestinationInterests, {
    error: "Choose a destination",
  }),
  message: optionalMessageSchema,
  consent: z.boolean().refine((value) => value === true, {
    error: "Consent is required before we can store this message",
  }),
});

export const leadSubmissionSchema = leadFormSchema.extend({
  turnstileToken: z
    .string()
    .trim()
    .min(1, "Confirm you are not a robot before sending"),
  source: z.string().trim().max(40).optional(),
});

export const leadClientSchema = leadFormSchema.extend({
  turnstileToken: z
    .string()
    .trim()
    .min(1, "Confirm you are not a robot before sending"),
  [HONEYPOT_FIELD]: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
export type LeadSubmissionValues = z.infer<typeof leadSubmissionSchema>;
export type LeadClientValues = z.infer<typeof leadClientSchema>;

export function resolveLeadSource(value: string | undefined): string {
  if (value && (leadSources as readonly string[]).includes(value)) {
    return value;
  }

  return "website";
}

export function isHoneypotFilled(input: unknown): boolean {
  if (!input || typeof input !== "object") {
    return false;
  }

  const value = (input as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}

const destinationFilterValues = ["", ...leadDestinationInterests] as const;
const statusFilterValues = ["", ...leadStatuses] as const;

export const leadListSortValues = ["created", "status"] as const;

export const LEADS_PAGE_SIZE = 25;

export const leadListQuerySchema = z.object({
  q: z.string().trim().max(120).catch(""),
  destinationInterest: z.enum(destinationFilterValues).catch(""),
  status: z.enum(statusFilterValues).catch(""),
  sort: z.enum(leadListSortValues).catch("created"),
  page: z.coerce.number().int().min(1).catch(1),
  lead: z
    .string()
    .trim()
    .catch("")
    .transform((value) =>
      z.string().uuid().safeParse(value).success ? value : "",
    ),
});

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;

export const moveLeadStageSchema = z.object({
  leadId: z.string().uuid(),
  fromStatus: z.enum(leadStatuses),
  toStatus: z.enum(leadStatuses),
  forceFail: z.boolean().optional(),
});

export type MoveLeadStageInput = z.infer<typeof moveLeadStageSchema>;

export const addLeadNoteSchema = z.object({
  leadId: z.string().uuid(),
  content: z
    .string()
    .trim()
    .min(1, "Write a note before saving")
    .max(4000, "Keep notes under 4,000 characters"),
  isVisibleToStudent: z.boolean().optional().default(false),
});

export type AddLeadNoteInput = z.infer<typeof addLeadNoteSchema>;

export const assignLeadCounselorSchema = z.object({
  leadId: z.string().uuid(),
  counselorId: z.union([z.literal(""), z.string().uuid()]),
});

export type AssignLeadCounselorInput = z.infer<
  typeof assignLeadCounselorSchema
>;
