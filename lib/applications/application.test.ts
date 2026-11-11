import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applicationDataSchema,
  canEditApplication,
  emptyApplicationData,
  emptyEducation,
  submittedApplicationSchema,
} from "@/lib/applications/schema";
import {
  applicationDocumentChecklist,
  missingApplicationDocuments,
} from "@/lib/applications/documents";
import {
  canAutoLinkStudent,
  verifiedClerkContacts,
} from "@/lib/applications/identity";
import { applicationReviewSchema } from "@/lib/applications/review-schema";
import { createDocumentUploadIntentSchema } from "@/lib/schemas/document";
import { parseLeadListQuery, leadsListHref } from "@/lib/leads/list-query";

function complete() {
  return {
    ...emptyApplicationData(),
    fullName: "Sample Student",
    dateOfBirth: "2003-01-02",
    passportNumber: "SAMPLE123",
    passportExpiry: "2099-01-01",
    phone: "+8801700000000",
    address: "Sample address",
    country: "china" as const,
    preferredUniversity: "Student’s chosen university",
    course: "Engineering",
    intake: "September 2027",
    education: [
      {
        ...emptyEducation("hsc"),
        institution: "Sample College",
        subject: "Science",
        passingYear: "2025",
        result: "4.5",
        gradingScale: "5.0",
      },
    ],
    consent: true,
  };
}
test("drafts can be incomplete, but submission requires personal, academic and consent details", () => {
  assert.equal(
    applicationDataSchema.safeParse(emptyApplicationData()).success,
    true,
  );
  assert.equal(
    submittedApplicationSchema.safeParse(emptyApplicationData()).success,
    false,
  );
  assert.equal(submittedApplicationSchema.safeParse(complete()).success, true);
  for (const patch of [
    { consent: false },
    { passportNumber: "" },
    { preferredUniversity: "" },
    { country: "undecided" },
    { education: [] },
    { dateOfBirth: "2026-02-30" },
    { passportExpiry: "2020-01-01" },
  ])
    assert.equal(
      submittedApplicationSchema.safeParse({ ...complete(), ...patch }).success,
      false,
    );
});
test("academic qualifications cannot be duplicated at submission", () => {
  const data = complete();
  assert.equal(
    submittedApplicationSchema.safeParse({
      ...data,
      education: [...data.education, ...data.education],
    }).success,
    false,
  );
});
test("diploma checklist includes eight semesters and adds sensitive documents only when requested", () => {
  const data = { ...complete(), education: [emptyEducation("diploma")] };
  const types = applicationDocumentChecklist(data).map(
    (s) => s.documentTypeKey,
  );
  assert.equal(
    types.filter((key) => key.startsWith("diploma_transcript_")).length,
    8,
  );
  assert.equal(types.includes("medical"), false);
  assert.equal(types.includes("parent_id"), false);
  const requested = applicationDocumentChecklist(data, [
    "medical",
    "parent_id",
  ]);
  assert.equal(
    requested.find((s) => s.documentTypeKey === "medical")?.required,
    true,
  );
});
test("pending files permit review submission; rejected files require replacement", () => {
  const data = complete();
  const files = applicationDocumentChecklist(data).map((slot) => ({
    type: slot.documentTypeKey,
    status: "pending" as const,
  }));
  assert.equal(missingApplicationDocuments(data, [], files).length, 0);
  assert.equal(
    missingApplicationDocuments(
      data,
      [],
      files.map((f) => ({ ...f, status: "rejected" })),
    ).length,
    files.length,
  );
});
test("new document categories pass the upload gate and unknown categories remain blocked", () => {
  const upload = {
    applicationId: "11111111-1111-4111-8111-111111111111",
    type: "diploma_transcript_8",
    filename: "semester8.pdf",
    contentType: "application/pdf",
    size: 1000,
  };
  assert.equal(
    createDocumentUploadIntentSchema().safeParse(upload).success,
    true,
  );
  assert.equal(
    createDocumentUploadIntentSchema().safeParse({
      ...upload,
      type: "made_up_category",
    }).success,
    false,
  );
});
test("typing another student’s phone cannot auto-link their records", () => {
  const lead = {
    leadEmail: "student@example.invalid",
    leadPhone: "01700000000",
  };
  assert.equal(canAutoLinkStudent(lead), false);
  assert.equal(
    canAutoLinkStudent({ ...lead, verifiedEmail: "other@example.invalid" }),
    false,
  );
  assert.equal(
    canAutoLinkStudent({ ...lead, verifiedEmail: "Student@example.invalid" }),
    true,
  );
  assert.equal(
    canAutoLinkStudent({ ...lead, verifiedPhone: "+8801700000000" }),
    true,
  );
  assert.deepEqual(
    verifiedClerkContacts({
      emailAddresses: [
        {
          emailAddress: "test@example.invalid",
          verification: { status: "unverified" },
        },
      ],
      phoneNumbers: [],
    }),
    { verifiedEmail: null, verifiedPhone: null },
  );
});
test("unavailable choices need an explanation and agreed alternatives need recorded student agreement", () => {
  const review = {
    id: "11111111-1111-4111-8111-111111111111",
    revision: 0,
    requestChanges: false,
    reviewMessage: "",
    universityReview: "reviewing",
    proposedUniversity: "",
    universityNote: "",
    requestedDocuments: [],
    contactNote: "",
  };
  assert.equal(applicationReviewSchema.safeParse(review).success, true);
  assert.equal(
    applicationReviewSchema.safeParse({
      ...review,
      universityReview: "unavailable",
    }).success,
    false,
  );
  const alternative = {
    ...review,
    universityReview: "agreed",
    proposedUniversity: "Alternative campus",
    universityNote: "Alternative accepted",
  };
  assert.equal(applicationReviewSchema.safeParse(alternative).success, false);
  assert.equal(
    applicationReviewSchema.safeParse({
      ...alternative,
      contactNote: "Student agreed during phone call today",
    }).success,
    true,
  );
  assert.equal(canEditApplication("submitted"), false);
  assert.equal(canEditApplication("changes_requested"), true);
});
test("all-leads links retain source filters through pagination without an assessment-only default", () => {
  assert.equal(leadsListHref(parseLeadListQuery({})), "/admin/leads");
  const url = new URL(
    leadsListHref(parseLeadListQuery({ source: "contact", q: "Nafia" }), {
      page: 2,
    }),
    "https://example.invalid",
  );
  assert.equal(url.searchParams.get("source"), "contact");
  assert.equal(url.searchParams.get("page"), "2");
  assert.equal(url.searchParams.has("view"), false);
  assert.equal(parseLeadListQuery({ source: "untrusted" }).source, "");
});
