import assert from "node:assert/strict";
import { test } from "node:test";

import { DOCUMENT_REJECT_NOTE_MESSAGE } from "@/lib/documents/constants";
import { documentReviewActivityContent } from "@/lib/documents/review-copy";
import { reviewDocumentSchema } from "@/lib/schemas/document";
import { validateRequest } from "@/lib/validation-helpers";

const base = {
  documentId: "11111111-1111-4111-8111-111111111111",
  leadId: "22222222-2222-4222-8222-222222222222",
};

test("rejecting without a note is blocked with a clear validation message", () => {
  const missing = validateRequest(reviewDocumentSchema, {
    ...base,
    decision: "rejected",
  });
  assert.equal(missing.success, false);
  if (!missing.success) {
    assert.equal(
      missing.error.fields.reviewNote?.[0],
      DOCUMENT_REJECT_NOTE_MESSAGE,
    );
  }

  const blank = validateRequest(reviewDocumentSchema, {
    ...base,
    decision: "rejected",
    reviewNote: "   ",
  });
  assert.equal(blank.success, false);
  if (!blank.success) {
    assert.equal(
      blank.error.fields.reviewNote?.[0],
      DOCUMENT_REJECT_NOTE_MESSAGE,
    );
  }
});

test("rejecting with a note and approving without one both pass", () => {
  const rejected = validateRequest(reviewDocumentSchema, {
    ...base,
    decision: "rejected",
    reviewNote: "The photo page is cut off — send a full-page colour scan.",
  });
  assert.equal(rejected.success, true);

  const approved = validateRequest(reviewDocumentSchema, {
    ...base,
    decision: "approved",
  });
  assert.equal(approved.success, true);
});

test("student-facing copy includes the rejection reason", () => {
  const approved = documentReviewActivityContent({
    decision: "approved",
    type: "transcript",
    filename: "marksheet.pdf",
    reviewNote: null,
  });
  assert.match(approved, /approved/i);
  assert.match(approved, /marksheet\.pdf/);

  const rejected = documentReviewActivityContent({
    decision: "rejected",
    type: "passport",
    filename: "passport.jpg",
    reviewNote: "The photo page is cut off.",
  });
  assert.match(rejected, /needs another file/i);
  assert.match(rejected, /The photo page is cut off/);
});
