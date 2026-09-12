import { z } from "zod";

import {
  programCountries,
  programLevels,
  tuitionCurrencies,
} from "@/db/schema";

export const programCountryValues = programCountries;
export const programLevelValues = programLevels;
export const tuitionCurrencyValues = tuitionCurrencies;

export const intakeMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const programCountrySchema = z.enum(programCountries);
export const programLevelSchema = z.enum(programLevels);
export const tuitionCurrencySchema = z.enum(tuitionCurrencies);
export const intakeMonthSchema = z.enum(intakeMonths);

/**
 * Shared create/edit schema — imported by the admin form and server actions.
 * `isPublished` is intentionally omitted: new rows stay drafts, and
 * publish/unpublish is a separate admin action.
 */
export const programFormSchema = z.object({
  universityName: z
    .string()
    .trim()
    .min(1, "University name is required")
    .max(200),
  country: programCountrySchema,
  level: programLevelSchema,
  field: z.string().trim().min(1, "Field of study is required").max(200),
  tuitionAmount: z.coerce
    .number()
    .positive("Tuition amount must be greater than 0")
    .finite(),
  tuitionCurrency: tuitionCurrencySchema,
  intakeMonths: z.array(intakeMonthSchema).default([]),
  requirements: z.string().trim().max(5000).optional().default(""),
  scholarshipInfo: z.string().trim().max(5000).optional().default(""),
});

export type ProgramFormValues = z.infer<typeof programFormSchema>;

export const programIdSchema = z.object({
  id: z.string().uuid(),
});

export const programPublishSchema = z.object({
  id: z.string().uuid(),
  isPublished: z.boolean(),
});

const countryFilterValues = ["", ...programCountries] as const;
const levelFilterValues = ["", ...programLevels] as const;

export const programListQuerySchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  country: z.enum(countryFilterValues).optional().default(""),
  level: z.enum(levelFilterValues).optional().default(""),
  status: z.enum(["all", "published", "draft"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type ProgramListQuery = z.infer<typeof programListQuerySchema>;
