import type { CounsellorContact, StoredAssessment } from "./schema";

export type AssessmentRow = { label: string; value: string | string[] };
export type AssessmentSection = { title: string; rows: AssessmentRow[] };
export type AssessmentDetails = {
  assessment: StoredAssessment;
  counselor?: CounsellorContact | null;
  source?: string | null;
  consentVersion?: string | null;
  consentAt?: Date | string | null;
};

export function formatAssessmentDate(value?: Date | string | null): string {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Not recorded";
  const day = date.toLocaleDateString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} at ${time} (Dhaka)`;
}

export function formatAssessmentStatus(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function formatIntake(value: string): string {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return value;
  return new Date(`${value}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

export function buildAssessmentSections({
  assessment: a,
  counselor,
  source,
  consentVersion,
  consentAt,
}: AssessmentDetails): AssessmentSection[] {
  const sections: AssessmentSection[] = [];
  const section = (
    title: string,
    values: [string, string | string[] | undefined | null][],
  ) => {
    const rows = values.flatMap(([label, value]): AssessmentRow[] => {
      const cleaned = Array.isArray(value)
        ? value.map((item) => item.trim()).filter(Boolean)
        : value?.trim();
      return cleaned?.length ? [{ label, value: cleaned }] : [];
    });
    if (rows.length) sections.push({ title, rows });
  };
  const c = counselor === undefined ? a.assignedCounselor : counselor;
  section("Personal & contact details", [
    ["Full name", a.name],
    [
      "Date of birth",
      a.dob
        ? new Date(`${a.dob}T00:00:00Z`).toLocaleDateString("en-GB", {
            timeZone: "UTC",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "",
    ],
    ["Age", a.age ? `${a.age} years` : ""],
    ["Current location", a.location],
    ["Passport availability", a.passport],
    ["Mobile number", a.phone],
    ["WhatsApp number", a.whatsapp || a.phone],
    ["Email address", a.email || "Not provided"],
  ]);
  section("Academic background", [
    ["SSC / equivalent result", a.sscGrade],
    ["SSC / equivalent passing year", a.sscYear],
    ["HSC / equivalent status", a.hscStatus],
    ["HSC / equivalent result", a.hscGrade],
    [
      a.hscStatus === "Completed"
        ? "HSC / equivalent passing year"
        : "Expected HSC passing year",
      a.hscYear,
    ],
    ["Bachelor’s CGPA / grade", a.bachelorGrade],
    ["Bachelor’s passing year", a.bachelorYear],
    ["University / institution", a.institution],
    ["Last degree / qualification", a.lastDegree],
    ["Last subject / major", a.lastSubject],
    ["Most recent postgraduate result", a.previousDegreeResult],
    ["Postgraduate passing year", a.previousDegreeYear],
    ["Study gap", a.studyGap === "No" ? "No study gap" : a.studyGap],
    ["Study gap duration", a.gapDuration],
    ["Study gap explanation", a.gapExplanation],
  ]);
  section("Study plan", [
    ["Preferred country", a.country],
    ["Intended degree", a.degree],
    ["Preferred subject", a.subject],
    [
      "Preferred intake",
      a.intakeUnsure ? "Not sure yet" : formatIntake(a.intake),
    ],
  ]);
  section("Language proficiency", [
    [
      "Language tests",
      (a.languages ?? []).map((l) =>
        l.test === "Not Taken"
          ? "No language test taken"
          : `${l.test}: ${l.score || "Score / status not provided"}`,
      ),
    ],
    ["HSK level", a.hskLevel],
    ["HSK score", a.hskScore],
  ]);
  section("Research & supporting documents", [
    ["Research publications", a.publications],
    ["Number of publications", a.publicationCount],
    ["Publication details", a.publicationDetails],
    ["Recommendation letters", a.recommendations],
    [
      "Supporting documents available",
      a.supportingDocuments?.length ? a.supportingDocuments : "None selected",
    ],
    ["Additional information", a.otherInformation],
  ]);
  section("Counsellor details", [
    ["Counsellor", c?.fullName ?? "Pending assignment"],
    ["Role", c?.title],
    ["Phone", c?.phone],
    ["WhatsApp", c?.whatsapp],
  ]);
  section("Submission & consent", [
    [
      "Submitted through",
      source === "consultation" ? "Student assessment form" : source,
    ],
    ["Campaign source", a.attribution?.source],
    ["Campaign medium", a.attribution?.medium],
    ["Campaign name", a.attribution?.campaign],
    ["Campaign content", a.attribution?.content],
    ["Campaign search term", a.attribution?.term],
    [
      "Contact consent",
      a.consent === true
        ? "Agreed to information storage and counselling contact"
        : "Not recorded",
    ],
    ["Consent recorded", consentAt ? formatAssessmentDate(consentAt) : ""],
    ["Consent policy version", consentVersion],
  ]);
  return sections;
}
