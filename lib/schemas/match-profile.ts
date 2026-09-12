import { z } from "zod";

import {
  budgetBands,
  educationLevels,
  eligibilityDestinations,
} from "@/lib/eligibility";

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

export const matchProfileFormSchema = z.object({
  educationLevel: z.enum(educationLevels, {
    error: "Choose your current education level",
  }),
  destinations: z
    .array(z.enum(eligibilityDestinations))
    .min(1, "Choose at least one destination")
    .max(4),
  ielts: optionalScore(9, "IELTS"),
  toefl: optionalScore(120, "TOEFL"),
  hsk: optionalScore(6, "HSK"),
  topik: optionalScore(6, "TOPIK"),
  budget: z.enum(budgetBands, {
    error: "Choose a budget range",
  }),
});

export type MatchProfileFormValues = z.infer<typeof matchProfileFormSchema>;
