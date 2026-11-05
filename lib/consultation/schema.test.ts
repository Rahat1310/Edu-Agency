import assert from "node:assert/strict";
import { test } from "node:test";
import { assessmentSchema, normalizePhone } from "./schema";
const valid = {
  name: "  Test   Student  ",
  dob: "",
  age: "20",
  phone: "01712345678",
  whatsapp: "",
  email: "",
  location: "Dhaka",
  passport: "No",
  sscGrade: "A",
  sscYear: "2022",
  hscStatus: "Completed",
  hscGrade: "85%",
  hscYear: "2024",
  bachelorGrade: "",
  bachelorYear: "",
  institution: "",
  lastDegree: "HSC",
  lastSubject: "Science",
  previousDegreeResult: "",
  previousDegreeYear: "",
  studyGap: "No",
  gapDuration: "",
  gapExplanation: "",
  country: "China",
  degree: "Bachelor's",
  subject: "Not Sure Yet",
  intake: "",
  intakeUnsure: true,
  languages: [{ test: "Not Taken", score: "" }],
  hskLevel: "",
  hskScore: "",
  publications: "",
  publicationCount: "",
  publicationDetails: "",
  recommendations: "",
  consent: true,
};
test("normal assessment trims name and normalizes Bangladesh phone", () => {
  const a = assessmentSchema.parse(valid);
  assert.equal(a.name, "Test Student");
  assert.equal(a.phone, "+8801712345678");
});
test("phone normalization preserves overseas numbers", () => {
  assert.equal(normalizePhone("+44 7700 900123"), "+447700900123");
  assert.equal(normalizePhone("008801712345678"), "+8801712345678");
  assert.equal(
    assessmentSchema.safeParse({ ...valid, phone: "123" }).success,
    false,
  );
});
test("DOB or age required, impossible dates rejected", () => {
  for (const data of [
    { age: "" },
    { dob: "2020-02-31" },
    { age: "101" },
    { dob: "1999-13-01" },
  ])
    assert.equal(
      assessmentSchema.safeParse({ ...valid, ...data }).success,
      false,
    );
  assert.equal(
    assessmentSchema.safeParse({ ...valid, age: "", dob: "2000-01-01" })
      .success,
    true,
  );
});
test("missing fields, invalid email, oversized input and absent consent rejected", () => {
  for (const data of [
    { name: "" },
    { location: "" },
    { consent: false },
    { email: "bad" },
    { name: "a".repeat(161) },
    { sscYear: "1800" },
  ])
    assert.equal(
      assessmentSchema.safeParse({ ...valid, ...data }).success,
      false,
    );
});
test("HSC pending allows missing grade/year without requiring bachelor", () => {
  assert.equal(
    assessmentSchema.safeParse({
      ...valid,
      hscStatus: "Result Pending / Appearing",
      hscGrade: "",
      hscYear: "",
    }).success,
    true,
  );
});
test("master requires bachelor and recommendations; PhD also postgraduate history", () => {
  assert.equal(
    assessmentSchema.safeParse({ ...valid, degree: "Master's" }).success,
    false,
  );
  const master = {
    ...valid,
    degree: "Master's",
    bachelorGrade: "3.7/4",
    bachelorYear: "2026",
    recommendations: "In Progress",
  };
  assert.equal(assessmentSchema.safeParse(master).success, true);
  assert.equal(
    assessmentSchema.safeParse({
      ...master,
      degree: "PhD",
      publications: "No",
      previousDegreeResult: "A",
      previousDegreeYear: "2026",
    }).success,
    true,
  );
  assert.equal(
    assessmentSchema.safeParse({ ...master, degree: "PhD" }).success,
    false,
  );
});
test("gap requires duration, explanation optional", () => {
  assert.equal(
    assessmentSchema.safeParse({ ...valid, studyGap: "Yes" }).success,
    false,
  );
  assert.equal(
    assessmentSchema.safeParse({
      ...valid,
      studyGap: "Yes",
      gapDuration: "2 years",
    }).success,
    true,
  );
});
test("language rules permit MOI status, reject missing/out-of-range scores and contradictory tests", () => {
  assert.equal(
    assessmentSchema.safeParse({
      ...valid,
      languages: [{ test: "MOI", score: "Available" }],
    }).success,
    true,
  );
  for (const languages of [
    [{ test: "IELTS", score: "10" }],
    [{ test: "IELTS", score: "" }],
    [
      { test: "Not Taken", score: "" },
      { test: "MOI", score: "Available" },
    ],
  ])
    assert.equal(
      assessmentSchema.safeParse({ ...valid, languages }).success,
      false,
    );
});
test("invalid intake, HSK, chronology and duplicate tests rejected", () => {
  for (const data of [
    { intakeUnsure: false, intake: "2020-01" },
    { hskLevel: "11" },
    { hskScore: "301" },
    { hscYear: "2020" },
    {
      languages: [
        { test: "MOI", score: "Available" },
        { test: "MOI", score: "Available" },
      ],
    },
  ])
    assert.equal(
      assessmentSchema.safeParse({ ...valid, ...data }).success,
      false,
    );
});
test("server-owned properties are stripped", () => {
  const a = assessmentSchema.parse({
    ...valid,
    status: "CLOSED",
    assignedCounselorId: "bad",
    reference: "fake",
    assignedCounselor: { fullName: "Forged assignment" },
  });
  assert.equal("status" in a, false);
  assert.equal("reference" in a, false);
  assert.equal("assignedCounselor" in a, false);
});

import { escapeHtml } from "./email-html";
test("HTML email content escapes hostile markup", () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="alert(1)"> & 'test'`),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;test&#39;",
  );
});
