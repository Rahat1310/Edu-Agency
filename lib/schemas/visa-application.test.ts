import assert from "node:assert/strict";
import { test } from "node:test";

import { updateVisaApplicationSchema } from "@/lib/schemas/visa-application";
import { validateRequest } from "@/lib/validation-helpers";

const leadId = "11111111-1111-4111-8111-111111111111";

test("visa tracking accepts a sub-status, reference, and dates", () => {
  const parsed = validateRequest(updateVisaApplicationSchema, {
    leadId,
    subStatus: "submitted",
    referenceNumber: " SII-123 ",
    submittedAt: "2026-08-16T10:00",
    decidedAt: "",
    notes: "  ",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.referenceNumber, "SII-123");
    assert.equal(parsed.data.notes, null);
    assert.equal(parsed.data.decidedAt, null);
    assert.equal(parsed.data.submittedAt instanceof Date, true);
  }
});

test("raw unknown sub-status values are rejected", () => {
  const parsed = validateRequest(updateVisaApplicationSchema, {
    leadId,
    subStatus: "preparing_documents_nope",
  });
  assert.equal(parsed.success, false);
});
