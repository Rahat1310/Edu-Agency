import type { BudgetBand, EducationLevel } from "@/lib/eligibility";

export const matchEducationLabels: Record<EducationLevel, string> = {
  hsc: "HSC / A-level / equivalent",
  bachelor: "Bachelor’s degree completed",
  master: "Master’s degree completed",
  diploma: "Diploma / polytechnic",
};

export const matchBudgetLabels: Record<BudgetBand, string> = {
  under_8l: "Under ৳8 lakh",
  "8_15l": "৳8–15 lakh",
  "15_25l": "৳15–25 lakh",
  over_25l: "Over ৳25 lakh",
};
