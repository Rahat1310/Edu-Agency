import { z } from "zod";

import { programCountries } from "@/db/schema";
import { normalizeMarketingPhotoKey } from "@/lib/success-stories/photo";

export const successStoryFormSchema = z.object({
  studentName: z.string().trim().min(1, "Student name is required").max(120),
  destination: z.enum(programCountries),
  university: z.string().trim().min(1, "University is required").max(200),
  program: z.string().trim().min(1, "Program is required").max(200),
  quote: z.string().trim().min(1, "Quote is required").max(1500),
  photoR2Key: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => normalizeMarketingPhotoKey(value) !== undefined,
      "Use a public marketing object key (e.g. success-stories/name.jpg), not a private document path.",
    ),
});

export type SuccessStoryFormValues = z.infer<typeof successStoryFormSchema>;

export const successStoryIdSchema = z.object({
  id: z.string().uuid(),
});

export const successStoryPublishSchema = z.object({
  id: z.string().uuid(),
  isPublished: z.boolean(),
});

const destinationFilterValues = ["", ...programCountries] as const;

export const successStoryListQuerySchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  destination: z.enum(destinationFilterValues).optional().default(""),
  status: z.enum(["all", "published", "draft"]).optional().default("all"),
});
