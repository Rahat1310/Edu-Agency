import assert from "node:assert/strict";
import { test } from "node:test";

import { leadClientSchema, leadSubmissionSchema } from "@/lib/schemas/lead";
import { submitLead } from "@/lib/leads/submit-lead";

const message = {
  name: "Test Student",
  phone: "+8801700000000",
  destinationInterest: "china",
  consent: true,
  turnstileToken: "",
};

test("an unconfigured spam check does not silently block a valid form", () => {
  assert.equal(leadClientSchema.safeParse(message).success, true);
  assert.equal(leadSubmissionSchema.safeParse(message).success, true);
});

test("contact details and consent are still required", () => {
  assert.equal(leadClientSchema.safeParse({ ...message, phone: "" }).success, false);
  assert.equal(leadClientSchema.safeParse({ ...message, consent: false }).success, false);
});

test("a partially configured spam check fails visibly instead of being skipped", async () => {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
  delete process.env.TURNSTILE_SECRET_KEY;
  try {
    const result = await submitLead(message, "lead-config-regression");
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "config");
  } finally {
    if (siteKey === undefined) delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    else process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = siteKey;
    if (secret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = secret;
  }
});
