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
  data?: ApplicationData,
  requested: readonly string[] = [],
): ApplicationDocumentSlot[] {
  const core = new Set([
    "passport",
    "photo",
    "medical",
    "non_criminal",
    "bank_statement",
    "parent_id",
    "resume",
  ]);
  for (const { qualification } of data?.education ?? []) {
    core.add(`${qualification}_certificate`);
    if (qualification === "diploma")
      for (let i = 1; i <= 8; i++) core.add(`diploma_transcript_${i}`);
    else core.add(`${qualification}_transcript`);
  }
  if (data?.englishQualification) core.add("english_proficiency");
  if (data?.hskQualification) core.add("hsk");
  return applicationDocumentKeys.map((type) => ({
    documentTypeKey: type,
    documentName: applicationDocumentLabels[type]!,
    required: core.has(type) || requested.includes(type),
    description: requested.includes(type)
      ? "Requested by your admissions team. Upload it when available; you can submit your form first."
      : core.has(type)
        ? "Required document for your application. Upload it when available; you can submit your form first."
        : "Upload this only if needed for your application and you have it available.",
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
