export const eligibilitySteps = [
  "destination",
  "education",
  "tests",
  "budget",
  "contact",
] as const;

const stepFields = [
  ["destination"],
  ["educationLevel"],
  ["hsk", "topik", "ielts", "toefl"],
  ["budget"],
  ["name", "phone", "whatsapp", "email", "consent", "turnstileToken"],
];

export function firstInvalidEligibilityStep(fields: readonly string[]) {
  const index = stepFields.findIndex((step) =>
    step.some((field) => fields.includes(field)),
  );
  return index === -1 ? eligibilitySteps.length - 1 : index;
}
