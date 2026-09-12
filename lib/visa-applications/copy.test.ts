import assert from "node:assert/strict";
import { test } from "node:test";

import {
  visaApplicationAuditLine,
  visaApplicationStudentLine,
} from "@/lib/visa-applications/copy";
import { isVisaPipelineStage } from "@/lib/visa-applications/stage";

test("student visa copy uses plain language, never the raw enum", () => {
  const submitted = visaApplicationStudentLine({
    subStatus: "submitted",
    referenceNumber: "XXXX",
  });

  assert.equal(
    submitted,
    "Your visa application has been submitted, reference #XXXX.",
  );
  assert.equal(submitted.includes("submitted"), true);
  assert.equal(submitted.includes("preparing_documents"), false);

  const preparing = visaApplicationStudentLine({
    subStatus: "preparing_documents",
    referenceNumber: null,
  });
  assert.equal(preparing.includes("preparing_documents"), false);
  assert.match(preparing, /preparing the documents/i);

  const interview = visaApplicationStudentLine({
    subStatus: "interview_scheduled",
    referenceNumber: "#EMGS-1",
  });
  assert.equal(interview.includes("interview_scheduled"), false);
  assert.match(interview, /reference #EMGS-1/);
});

test("rejected copy does not invent an admission chance", () => {
  const rejected = visaApplicationStudentLine({
    subStatus: "rejected",
    referenceNumber: "SII-9",
  });
  assert.equal(rejected.includes("rejected"), false);
  assert.match(rejected, /not approved/i);
  assert.equal(rejected.includes("SII-9"), false);
});

test("sub-status changes write student-facing audit copy", () => {
  const line = visaApplicationAuditLine({
    subStatus: "approved",
    referenceNumber: null,
    subStatusChanged: true,
    referenceChanged: false,
    datesChanged: false,
    notesChanged: false,
  });
  assert.equal(line, "Your visa application has been approved.");
});

test("date or note-only edits stay as an internal audit sentence", () => {
  const line = visaApplicationAuditLine({
    subStatus: "submitted",
    referenceNumber: "EMGS-2",
    subStatusChanged: false,
    referenceChanged: false,
    datesChanged: true,
    notesChanged: true,
  });
  assert.equal(line, "Visa tracking dates and notes updated.");
  assert.equal(line.includes("EMGS-2"), false);
});

test("visa tracking is visible on visa and departed, not earlier stages", () => {
  assert.equal(isVisaPipelineStage("offer"), false);
  assert.equal(isVisaPipelineStage("visa"), true);
  assert.equal(isVisaPipelineStage("departed"), true);
});
