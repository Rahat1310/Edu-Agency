import type { ApplicationData } from "@/lib/applications/schema";
import type { StudentDocumentRow } from "@/lib/documents/types";

export const applicationDocumentLabels: Record<string, string> = {
  passport: "Passport",
  photo: "Photo",
  ssc_certificate: "SSC certificate",
  dakhil_certificate: "Dakhil certificate",
  hsc_certificate: "HSC certificate",
  diploma_certificate: "Diploma certificate",
  alim_certificate: "Alim certificate",
  ssc_transcript: "SSC transcript",
  dakhil_transcript: "Dakhil transcript",
  hsc_transcript: "HSC transcript",
  alim_transcript: "Alim transcript",
  bachelor_certificate: "Bachelor’s certificate",
  bachelor_transcript: "Bachelor’s transcript",
  master_certificate: "Master’s certificate",
  master_transcript: "Master’s transcript",
  english_proficiency: "English proficiency certificate",
  hsk: "HSK certificate",
  medical: "Medical report",
  non_criminal: "Non-criminal certificate",
  bank_statement: "Bank statement",
  recommendation_letter: "Recommendation letter",
  study_plan: "Study plan",
  work_certificate: "Work certificate",
  award_certificate: "Award certificate",
  parent_id: "Father’s / mother’s ID",
  salary_certificate: "Salary certificate",
  resume: "Resume / CV",
  ...Object.fromEntries(
    Array.from({ length: 8 }, (_, i) => [
      `diploma_transcript_${i + 1}`,
      `Diploma transcript — semester ${i + 1}`,
    ]),
  ),
};
export const applicationDocumentKeys = Object.keys(applicationDocumentLabels);
export type ApplicationDocumentSlot = {
  documentTypeKey: string;
  documentName: string;
  description: string;
  required: boolean;
};
export function applicationDocumentChecklist(
  data: ApplicationData,
  requested: readonly string[] = [],
): ApplicationDocumentSlot[] {
  const core = new Set(["passport", "photo"]);
  for (const { qualification } of data.education) {
    core.add(`${qualification}_certificate`);
    if (qualification === "diploma")
      for (let i = 1; i <= 8; i++) core.add(`diploma_transcript_${i}`);
    else core.add(`${qualification}_transcript`);
  }
  const types = new Set([...core, ...requested]);
  if (data.englishQualification) types.add("english_proficiency");
  if (data.hskQualification) types.add("hsk");
  return [...types]
    .filter((type) => applicationDocumentLabels[type])
    .map((type) => ({
      documentTypeKey: type,
      documentName: applicationDocumentLabels[type]!,
      required: core.has(type) || requested.includes(type),
      description: core.has(type)
        ? "Core application document. Upload a clear copy; staff approval can follow submission."
        : requested.includes(type)
          ? "Requested by your admissions team for your application."
          : "Upload this if you have the qualification recorded in your form.",
    }));
}
export function missingApplicationDocuments(
  data: ApplicationData,
  requested: readonly string[],
  documents: readonly Pick<StudentDocumentRow, "type" | "status">[],
) {
  return applicationDocumentChecklist(data, requested).filter(
    (slot) =>
      slot.required &&
      !documents.some(
        (doc) => doc.type === slot.documentTypeKey && doc.status !== "rejected",
      ),
  );
}
