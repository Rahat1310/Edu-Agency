import { z } from "zod";

import { documentTypes, programCountries } from "@/db/schema";
import {
  DOCUMENT_TYPE_KEY_MESSAGE,
  DOCUMENT_TYPE_KEY_PATTERN,
} from "@/lib/documents/type-key";

export const visaRequirementFormSchema = z.object({
  destination: z.enum(programCountries),
  documentName: z
    .string()
    .trim()
    .min(1, "Document name is required")
    .max(200),
  documentTypeKey: z
    .string()
    .trim()
    .toLowerCase()
    .regex(DOCUMENT_TYPE_KEY_PATTERN, DOCUMENT_TYPE_KEY_MESSAGE)
    .refine(
      (value) => !(documentTypes as readonly string[]).includes(value),
      "That key is already a general document type. Use a destination-specific slug such as passport_copy.",
    ),
  description: z.string().trim().max(2000).default(""),
  notes: z.string().trim().max(2000).default(""),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export type VisaRequirementFormValues = z.infer<
  typeof visaRequirementFormSchema
>;

export const visaRequirementIdSchema = z.object({
  id: z.string().uuid(),
});

export const visaRequirementPublishSchema = z.object({
  id: z.string().uuid(),
  isPublished: z.boolean(),
});

export const visaRequirementMoveSchema = z.object({
  id: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

const destinationFilterValues = ["", ...programCountries] as const;

export const visaRequirementListQuerySchema = z.object({
  destination: z.enum(destinationFilterValues).optional().default(""),
  status: z.enum(["all", "published", "draft"]).optional().default("all"),
});
