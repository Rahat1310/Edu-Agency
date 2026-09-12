import assert from "node:assert/strict";
import { test } from "node:test";

import { DOCUMENT_MAX_BYTES } from "@/lib/documents/constants";
import { sniffDocumentMime } from "@/lib/documents/keys";
import { decideOwnedApplication } from "@/lib/documents/ownership";
import { gateDocumentUploadIntent } from "@/lib/documents/upload-gate";

const OWN = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

const validPdfIntent = {
  applicationId: OWN,
  type: "transcript" as const,
  filename: "marksheet.pdf",
  contentType: "application/pdf" as const,
  size: 1024,
};

test("refuses a signed-upload request for another student's applicationId", () => {
  const result = gateDocumentUploadIntent(OWN, {
    ...validPdfIntent,
    applicationId: OTHER,
  });

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.status, 403);
  assert.match(result.message, /another student's file/i);
});

test("refuses when there is no linked application", () => {
  const result = gateDocumentUploadIntent(null, validPdfIntent);
  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.status, 401);
});

test("rejects an executable before any R2 write would happen", () => {
  const exeMime = gateDocumentUploadIntent(OWN, {
    ...validPdfIntent,
    filename: "setup.exe",
    contentType: "application/x-msdownload",
  });
  assert.equal(exeMime.ok, false);
  if (!exeMime.ok) {
    assert.equal(exeMime.status, 400);
  }

  const exeName = gateDocumentUploadIntent(OWN, {
    ...validPdfIntent,
    filename: "setup.exe",
    contentType: "application/pdf",
  });
  assert.equal(exeName.ok, false);
  if (!exeName.ok) {
    assert.equal(exeName.status, 400);
  }
});

test("rejects a payload over the size cap before any R2 write would happen", () => {
  const result = gateDocumentUploadIntent(OWN, {
    ...validPdfIntent,
    size: DOCUMENT_MAX_BYTES + 1,
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 400);
    assert.match(result.message, /10 MB/i);
  }
});

test("accepts a valid PDF intent for the session application", () => {
  const result = gateDocumentUploadIntent(OWN, validPdfIntent);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.filename, "marksheet.pdf");
    assert.equal(result.data.applicationId, OWN);
  }
});

test("decideOwnedApplication is 403 on id mismatch, not a silent remap", () => {
  const mismatch = decideOwnedApplication(OWN, OTHER);
  assert.equal(mismatch.ok, false);
  if (!mismatch.ok) {
    assert.equal(mismatch.status, 403);
  }

  const match = decideOwnedApplication(OWN, OWN);
  assert.equal(match.ok, true);
});

test("sniffDocumentMime accepts PDF magic and rejects an MZ executable", () => {
  const pdf = sniffDocumentMime(Buffer.from("%PDF-1.4"));
  assert.equal(pdf, "application/pdf");

  const exe = sniffDocumentMime(Buffer.from("MZ"));
  assert.equal(exe, null);
});
