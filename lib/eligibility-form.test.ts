import assert from "node:assert/strict";
import { test } from "node:test";

import { firstInvalidEligibilityStep } from "@/lib/eligibility-form";

test("submission returns to the earliest step with a hidden validation error", () => {
  assert.equal(firstInvalidEligibilityStep(["phone", "destination"]), 0);
  assert.equal(firstInvalidEligibilityStep(["educationLevel"]), 1);
  assert.equal(firstInvalidEligibilityStep(["hsk", "email"]), 2);
  assert.equal(firstInvalidEligibilityStep(["budget"]), 3);
});

test("contact and general errors remain on the contact step", () => {
  assert.equal(firstInvalidEligibilityStep(["consent", "email"]), 4);
  assert.equal(firstInvalidEligibilityStep(["_root"]), 4);
  assert.equal(firstInvalidEligibilityStep([]), 4);
});
