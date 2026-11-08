import { z } from "zod";

export const countries = [
  "China",
  "South Korea",
  "India",
  "Malaysia",
  "Japan",
  "Other",
  "Not Sure Yet",
] as const;
export const statuses = [
  "NEW",
  "CONTACTED",
  "UNDER_ASSESSMENT",
  "OPTIONS_SHARED",
  "FILE_OPENED",
  "CLOSED",
] as const;
export const tests = [
  "IELTS",
  "TOEFL",
  "Duolingo",
  "MOI",
  "PTE",
  "CEFR",
  "EFSET",
  "TOPIK",
  "Other Proficiency",
  "Not Taken",
] as const;
export const CONSENT_VERSION = "assessment-contact-v1";
export const supportingDocumentOptions = [
  "Research paper",
  "Recommendation letter",
  "Statement of purpose (SOP) letter",
  "Extracurricular activities",
  "Other supporting documents",
  "Police clearance",
  "Medical certificate",
] as const;
export const CONSENT_TEXT =
  "I agree that Study Abroad Consultant will store my submitted information and contact me about counselling, admissions and scholarship enquiries.";
export function normalizePhone(raw: string) {
  let value = raw.trim().replace(/[\s().-]/g, "");
  if (/^01[3-9]\d{8}$/.test(value)) value = "+880" + value.slice(1);
  if (/^8801[3-9]\d{8}$/.test(value)) value = "+" + value;
  if (value.startsWith("00")) value = "+" + value.slice(2);
  return value;
}
const short = z.string().trim().max(160);
const required = short.min(1, "This field is required.");
const phone = z
  .string()
  .max(40)
  .transform(normalizePhone)
  .refine(
    (v) => /^\+[1-9]\d{6,14}$/.test(v),
    "Enter a Bangladesh mobile number or an international number with country code.",
  );
const year = z
  .string()
  .refine(
    (v) =>
      !v ||
      (/^\d{4}$/.test(v) && +v >= 1950 && +v <= new Date().getFullYear() + 2),
    "Enter a valid passing year.",
  );
export const assessmentSchema = z
  .object({
    name: required.transform((v) => v.replace(/\s+/g, " ")),
    dob: z.string().max(10),
    age: z.string().max(3),
    phone,
    whatsapp: z.union([z.literal(""), phone]),
    email: z.union([z.literal(""), z.email().max(254)]),
    location: required,
    passport: z.enum(["Yes", "No", "Applied / Processing"]),
    sscGrade: required,
    sscYear: year,
    hscStatus: z.enum(["Completed", "Result Pending / Appearing"]),
    hscGrade: short,
    hscYear: year,
    bachelorGrade: short,
    bachelorYear: year,
    institution: short,
    lastDegree: required,
    lastSubject: required,
    previousDegreeResult: short,
    previousDegreeYear: year,
    studyGap: z.enum(["Yes", "No"]),
    gapDuration: short,
    gapExplanation: z.string().trim().max(1500),
    country: z.enum(countries),
    degree: z.enum(["Bachelor's", "Master's", "PhD"]),
    subject: required,
    intake: z.string().max(20),
    intakeUnsure: z.boolean(),
    languages: z
      .array(z.object({ test: z.enum(tests), score: short }))
      .min(1)
      .max(10),
    hskLevel: z.string().max(2),
    hskScore: z.string().max(3),
    supportingDocuments: z
      .array(z.enum(supportingDocumentOptions))
      .max(supportingDocumentOptions.length)
      .optional(),
    otherInformation: z.string().trim().max(2000).optional(),
    publications: z.enum(["", "Yes", "No"]),
    publicationCount: z.string().max(4),
    publicationDetails: z.string().trim().max(2000),
    recommendations: z.enum(["", "Available", "Not Available", "In Progress"]),
    consent: z
      .boolean()
      .refine((v) => v, "Your consent is required to submit."),
    attribution: z
      .object({
        source: short,
        medium: short,
        campaign: short,
        content: short,
        term: short,
      })
      .optional(),
  })
  .superRefine((v, ctx) => {
    const error = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: path.split("."), message });
    if (!v.dob && !v.age) error("dob", "Provide date of birth or age.");
    if (v.age && (!/^\d+$/.test(v.age) || +v.age < 12 || +v.age > 100))
      error("age", "Age must be between 12 and 100.");
    if (v.dob) {
      const d = new Date(v.dob + "T00:00:00Z");
      const age = (Date.now() - d.getTime()) / 31557600000;
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(v.dob) ||
        !Number.isFinite(age) ||
        d.toISOString().slice(0, 10) !== v.dob ||
        age < 12 ||
        age > 100
      )
        error("dob", "Enter a valid date of birth (age 12–100).");
    }
    if (!v.sscYear) error("sscYear", "Passing year is required.");
    if (+v.sscYear > new Date().getFullYear())
      error(
        "sscYear",
        "Completed qualifications cannot have a future passing year.",
      );
    for (const field of ["bachelorYear", "previousDegreeYear"] as const)
      if (v[field] && +v[field] > new Date().getFullYear())
        error(
          field,
          "Completed qualifications cannot have a future passing year.",
        );
    if (v.hscStatus === "Completed") {
      if (+v.hscYear > new Date().getFullYear())
        error(
          "hscYear",
          "Completed qualifications cannot have a future passing year.",
        );
      if (!v.hscGrade) error("hscGrade", "Enter your HSC/equivalent result.");
      if (!v.hscYear) error("hscYear", "Passing year is required.");
    }
    if (v.degree !== "Bachelor's") {
      if (!v.bachelorGrade)
        error("bachelorGrade", "Enter your Bachelor's result.");
      if (!v.bachelorYear) error("bachelorYear", "Passing year is required.");
      if (!v.recommendations)
        error("recommendations", "Choose recommendation letter status.");
    }
    if (v.degree === "PhD") {
      if (!v.previousDegreeResult)
        error(
          "previousDegreeResult",
          "Enter your most recent postgraduate result.",
        );
      if (!v.previousDegreeYear)
        error("previousDegreeYear", "Passing year is required.");
      if (!v.publications) error("publications", "Choose Yes or No.");
    }
    if (v.studyGap === "Yes" && !v.gapDuration)
      error("gapDuration", "Enter the duration of your study gap.");
    if (!v.intakeUnsure) {
      if (
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(v.intake) ||
        v.intake < new Date().toISOString().slice(0, 7) ||
        +v.intake.slice(0, 4) > new Date().getFullYear() + 10
      )
        error("intake", "Choose a current or future intake, or Not Sure Yet.");
    }
    if (new Set(v.languages.map((l) => l.test)).size !== v.languages.length)
      error("languages", "Choose each test only once.");
    if (
      v.languages.length > 1 &&
      v.languages.some((l) => l.test === "Not Taken")
    )
      error("languages", "Not Taken cannot be combined with a test.");
    v.languages.forEach((l, i) => {
      if (l.test !== "Not Taken" && !l.score)
        error(
          `languages.${i}.score`,
          "Enter the score, level or availability status.",
        );
      const max = { IELTS: 9, TOEFL: 120, Duolingo: 160, PTE: 90, EFSET: 100 }[
        l.test as "IELTS"
      ];
      if (
        max &&
        l.score &&
        (!Number.isFinite(+l.score) || +l.score < 0 || +l.score > max)
      )
        error(`languages.${i}.score`, `Enter a score between 0 and ${max}.`);
    });
    if (v.hskLevel && !/^[1-9]$/.test(v.hskLevel))
      error("hskLevel", "HSK level must be 1–9.");
    if (v.hskScore && (!/^\d+$/.test(v.hskScore) || +v.hskScore > 300))
      error("hskScore", "Enter a score from 0 to 300.");
    if (v.publicationCount && !/^\d{1,4}$/.test(v.publicationCount))
      error("publicationCount", "Enter a whole number.");
    if (v.sscYear && v.hscYear && +v.hscYear < +v.sscYear)
      error("hscYear", "HSC year cannot precede SSC.");
    if (v.bachelorYear && v.hscYear && +v.bachelorYear < +v.hscYear)
      error("bachelorYear", "Bachelor's year cannot precede HSC.");
  });
export type Assessment = z.infer<typeof assessmentSchema>;
export type CounsellorContact = {
  fullName: string;
  title: string;
  phone: string;
  whatsapp: string;
};
// Written by the server after validation; never accepted from form input.
export type StoredAssessment = Assessment & {
  assignedCounselor?: CounsellorContact;
};
export type Confirmation = {
  reference: string;
  firstName: string;
  counselor: CounsellorContact | null;
  studentEmail?: string;
  emailStatus?: "queued" | "unavailable" | "not_provided";
};
