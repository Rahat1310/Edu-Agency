import assert from "node:assert/strict";
import { test } from "node:test";

import {
  eligibilityClientSchema,
  eligibilitySubmissionSchema,
} from "@/lib/schemas/eligibility";

const submission = {
  destination: "china",
  educationLevel: "hsc",
  budget: "8_15l",
  name: "Test Student",
  phone: "01712345678",
  whatsapp: "",
  email: "",
  consent: true,
  turnstileToken: "",
  ielts: "",
  toefl: "",
  hsk: "",
  topik: "",
};

test("quiz permits submission without a CAPTCHA token when CAPTCHA is unconfigured", () => {
  const parsed = eligibilityClientSchema.safeParse(submission);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.turnstileToken, "");
    assert.equal(parsed.data.ielts, undefined);
  }
});

test("quiz still requires consent and valid answers and contact details", () => {
  for (const invalid of [
    { consent: false },
    { phone: "abc" },
    { destination: "" },
    { budget: "" },
    { ielts: "10" },
  ]) {
    assert.equal(
      eligibilityClientSchema.safeParse({ ...submission, ...invalid }).success,
      false,
    );
  }
});

test("server accepts blank scores after client validation and JSON serialization", () => {
  const values = eligibilityClientSchema.parse(submission);
  const requestBody = JSON.parse(JSON.stringify(values));
  assert.equal("ielts" in requestBody, false);
  const parsed = eligibilitySubmissionSchema.safeParse(requestBody);
  assert.equal(parsed.success, true);
});

test("server retains supplied scores while accepting missing optional scores", () => {
  const values = eligibilityClientSchema.parse({ ...submission, hsk: "4" });
  const parsed = eligibilitySubmissionSchema.parse(
    JSON.parse(JSON.stringify(values)),
  );
  assert.equal(parsed.hsk, 4);
  assert.equal(parsed.ielts, undefined);
});
