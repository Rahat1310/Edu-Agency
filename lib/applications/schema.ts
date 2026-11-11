import { z } from "zod";
import { leadDestinationInterests, programLevels } from "@/db/schema";

const short = z.string().trim().max(160);
const date = z
  .string()
  .refine(
    (s) =>
      !s ||
      (/^\d{4}-\d{2}-\d{2}$/.test(s) &&
        !Number.isNaN(Date.parse(s)) &&
        new Date(s).toISOString().slice(0, 10) === s),
    "Enter a valid date",
  );
export const qualifications = [
  "ssc",
  "dakhil",
  "hsc",
  "diploma",
  "alim",
  "bachelor",
  "master",
] as const;
export const qualificationLabels: Record<
  (typeof qualifications)[number],
  string
> = {
  ssc: "SSC",
  dakhil: "Dakhil",
  hsc: "HSC",
  diploma: "Diploma",
  alim: "Alim",
  bachelor: "Bachelor’s degree",
  master: "Master’s degree",
};
export const formStatuses = [
  "draft",
  "submitted",
  "changes_requested",
] as const;
export const formStatusLabels = {
  draft: "Draft",
  submitted: "Submitted",
  changes_requested: "Changes requested",
};
export const universityReviewStatuses = [
  "reviewing",
  "available",
  "unavailable",
  "alternative_suggested",
  "agreed",
] as const;
export const universityReviewLabels = {
  reviewing: "Preference under review",
  available: "Preferred choice available",
  unavailable: "Preferred university unavailable",
  alternative_suggested: "Alternative university suggested",
  agreed: "University choice agreed",
};
export const educationSchema = z.object({
  qualification: z.enum(qualifications),
  institution: short,
  board: short,
  subject: short,
  passingYear: z
    .string()
    .trim()
    .max(4)
    .refine(
      (s) => !s || /^(19|20)\d{2}$/.test(s),
      "Enter a four-digit passing year",
    ),
  result: z.string().trim().max(40),
  gradingScale: z.string().trim().max(40),
});
export const applicationDataSchema = z.object({
  fullName: short,
  dateOfBirth: date,
  nationality: short,
  passportNumber: z.string().trim().max(40),
  passportExpiry: date,
  phone: z.string().trim().max(30),
  address: z.string().trim().max(600),
  guardianName: short,
  guardianPhone: z.string().trim().max(30),
  country: z.enum(leadDestinationInterests),
  level: z.enum(programLevels),
  preferredUniversity: short,
  course: short,
  intake: short,
  education: z.array(educationSchema).max(7),
  englishQualification: short,
  hskQualification: short,
  additionalInformation: z.string().trim().max(2000),
  consent: z.boolean(),
});
export type ApplicationData = z.infer<typeof applicationDataSchema>;
export type Education = z.infer<typeof educationSchema>;
export function emptyEducation(
  qualification: Education["qualification"] = "ssc",
): Education {
  return {
    qualification,
    institution: "",
    board: "",
    subject: "",
    passingYear: "",
    result: "",
    gradingScale: "",
  };
}
export function emptyApplicationData(): ApplicationData {
  return {
    fullName: "",
    dateOfBirth: "",
    nationality: "Bangladeshi",
    passportNumber: "",
    passportExpiry: "",
    phone: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    country: "undecided",
    level: "bachelor",
    preferredUniversity: "",
    course: "",
    intake: "",
    education: [emptyEducation("ssc"), emptyEducation("hsc")],
    englishQualification: "",
    hskQualification: "",
    additionalInformation: "",
    consent: false,
  };
}
export const submittedApplicationSchema = applicationDataSchema.superRefine(
  (data, ctx) => {
    for (const field of [
      "fullName",
      "dateOfBirth",
      "nationality",
      "passportNumber",
      "passportExpiry",
      "phone",
      "address",
      "preferredUniversity",
      "course",
      "intake",
    ] as const) {
      if (!data[field])
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Complete this field before submitting",
        });
    }
    if (
      data.dateOfBirth &&
      data.dateOfBirth >= new Date().toISOString().slice(0, 10)
    )
      ctx.addIssue({
        code: "custom",
        path: ["dateOfBirth"],
        message: "Date of birth must be in the past",
      });
    if (
      data.passportExpiry &&
      data.passportExpiry <= new Date().toISOString().slice(0, 10)
    )
      ctx.addIssue({
        code: "custom",
        path: ["passportExpiry"],
        message: "Enter a passport expiry date in the future",
      });
    if (data.country === "undecided")
      ctx.addIssue({
        code: "custom",
        path: ["country"],
        message: "Choose your study destination",
      });
    if (!/^[+\d][\d\s()-]{6,29}$/.test(data.phone))
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid contact number",
      });
    if (data.education.length === 0)
      ctx.addIssue({
        code: "custom",
        path: ["education"],
        message: "Add your academic history",
      });
    const seen = new Set<string>();
    data.education.forEach((entry, index) => {
      if (seen.has(entry.qualification))
        ctx.addIssue({
          code: "custom",
          path: ["education", index, "qualification"],
          message: "Each qualification should appear once",
        });
      seen.add(entry.qualification);
      for (const field of [
        "institution",
        "subject",
        "passingYear",
        "result",
        "gradingScale",
      ] as const) {
        if (!entry[field])
          ctx.addIssue({
            code: "custom",
            path: ["education", index, field],
            message: "Complete this academic detail",
          });
      }
    });
    if (!data.consent)
      ctx.addIssue({
        code: "custom",
        path: ["consent"],
        message: "Confirm your information before submitting",
      });
  },
);
export function canEditApplication(status: string) {
  return status === "draft" || status === "changes_requested";
}
export function applicationReference(id: string) {
  return `APP-${id.toUpperCase()}`;
}
