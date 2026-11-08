import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAssessmentSections, formatAssessmentDate } from "./presentation";
import { buildStaffAssessmentEmail } from "./staff-email";
import type { StoredAssessment } from "./schema";

const assessment: StoredAssessment = {
  name: "Test Student",
  dob: "2000-01-02",
  age: "",
  phone: "+8801712345678",
  whatsapp: "",
  email: "",
  location: "Dhaka",
  passport: "Yes",
  sscGrade: "4.5",
  sscYear: "2017",
  hscStatus: "Completed",
  hscGrade: "4",
  hscYear: "2019",
  bachelorGrade: "3",
  bachelorYear: "2024",
  institution: "",
  lastDegree: "mastrs",
  lastSubject: "ai",
  previousDegreeResult: "",
  previousDegreeYear: "",
  studyGap: "No",
  gapDuration: "",
  gapExplanation: "",
  country: "China",
  degree: "Master's",
  subject: "ai",
  intake: "2027-09",
  intakeUnsure: true,
  languages: [{ test: "Not Taken", score: "" }],
  hskLevel: "",
  hskScore: "",
  publications: "Yes",
  publicationCount: "3",
  publicationDetails: "",
  recommendations: "Available",
  supportingDocuments: ["Other supporting documents", "Research paper"],
  otherInformation: "",
  consent: true,
  attribution: { source: "", medium: "", campaign: "", term: "", content: "" },
  assignedCounselor: {
    fullName: "Test Counsellor",
    title: "Senior Student Counsellor",
    phone: "+8801712345678",
    whatsapp: "+8801712345678",
  },
};
const details = {
  assessment,
  source: "consultation",
  consentVersion: "assessment-contact-v1",
  consentAt: "2026-11-08T09:10:59.450Z",
};

test("assessment details show readable labels and lists without raw JSON or empty fields", () => {
  const sections = buildAssessmentSections(details);
  const rows = sections.flatMap((section) => section.rows);
  const value = (label: string) =>
    rows.find((row) => row.label === label)?.value;
  assert.equal(value("HSC / equivalent result"), "4");
  assert.equal(value("Bachelor’s CGPA / grade"), "3");
  assert.equal(value("Last degree / qualification"), "mastrs");
  assert.equal(value("Preferred intake"), "Not sure yet");
  assert.equal(value("Study gap"), "No study gap");
  assert.deepEqual(value("Language tests"), ["No language test taken"]);
  assert.deepEqual(
    value("Supporting documents available"),
    assessment.supportingDocuments,
  );
  assert.equal(value("Counsellor"), "Test Counsellor");
  assert.equal(value("Submitted through"), "Student assessment form");
  for (const label of [
    "Study gap explanation",
    "Campaign name",
    "HSK level",
    "Postgraduate passing year",
    "University / institution",
  ])
    assert.equal(value(label), undefined);
  assert.ok(!JSON.stringify(sections).includes("[object Object]"));
});

test("dates use Dhaka time and intakes use month names", () => {
  assert.equal(
    formatAssessmentDate(details.consentAt),
    "8 November 2026 at 3:10 pm (Dhaka)",
  );
  assert.equal(
    formatAssessmentDate("2026-11-08T21:30:00Z"),
    "9 November 2026 at 3:30 am (Dhaka)",
  );
  assert.equal(formatAssessmentDate(null), "Not recorded");
  assert.equal(formatAssessmentDate("invalid"), "Not recorded");
  const rows = buildAssessmentSections({
    assessment: {
      ...assessment,
      intakeUnsure: false,
      languages: [
        { test: "IELTS", score: "7" },
        { test: "MOI", score: "Available" },
      ],
    },
  }).flatMap((section) => section.rows);
  assert.equal(
    rows.find((r) => r.label === "Preferred intake")?.value,
    "September 2027",
  );
  assert.deepEqual(rows.find((r) => r.label === "Language tests")?.value, [
    "IELTS: 7",
    "MOI: Available",
  ]);
});

test("staff email escapes submitted content and includes the private production link", () => {
  const privateUrl =
    "https://studyabroadconsultantbd.com/admin/leads/4716fa50-814c-48f5-b721-d6d499e80b2e";
  const email = buildStaffAssessmentEmail({
    ...details,
    assessment: {
      ...assessment,
      name: '<img src=x onerror="alert(1)">',
      otherInformation: "First line\nSecond line",
      attribution: {
        ...assessment.attribution!,
        campaign: "Scholarships & admissions",
      },
    },
    reference: "SAC-TEST",
    submittedAt: details.consentAt,
    privateUrl,
  });
  assert.ok(email.text.includes("HSC / equivalent passing year: 2019"));
  assert.ok(email.text.includes("  • Research paper"));
  assert.ok(email.text.includes("Campaign name: Scholarships & admissions"));
  assert.ok(email.text.includes(privateUrl));
  assert.ok(!email.text.includes('"test":'));
  assert.ok(!email.text.includes("hscYear:"));
  assert.ok(!email.html.includes("<img"));
  assert.ok(email.html.includes("&lt;img"));
  assert.ok(email.html.includes("Scholarships &amp; admissions"));
  assert.ok(email.html.includes("First line<br>Second line"));
  assert.ok(email.html.includes(`<a href="${privateUrl}"`));
});
