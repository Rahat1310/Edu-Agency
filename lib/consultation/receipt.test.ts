import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAssessmentReceipt } from "./receipt";

const counselor = {
  fullName: "Test Counsellor",
  title: "Student Counsellor",
  phone: "+8801712345678",
  whatsapp: "+8801712345678",
};

test("student receipt preserves reference and counsellor contacts without private staff links", () => {
  const receipt = buildAssessmentReceipt(
    {
      firstName: "Student",
      reference: "SAC-TEST-000001",
      counselor,
    },
    counselor,
  );
  for (const value of [
    "SAC-TEST-000001",
    counselor.fullName,
    counselor.phone,
    "https://wa.me/8801712345678",
  ])
    assert.ok(receipt.text.includes(value));
  assert.ok(!receipt.text.includes("/admin/"));
  assert.ok(receipt.subject.includes("SAC-TEST-000001"));
});

test("receipt escapes user input in email HTML and marks pending assignment accurately", () => {
  const receipt = buildAssessmentReceipt(
    {
      firstName: "<script>alert(1)</script>",
      reference: "SAC-TEST-000002",
      counselor: null,
    },
    counselor,
  );
  assert.ok(!receipt.html.includes("<script>"));
  assert.ok(receipt.html.includes("&lt;script&gt;"));
  assert.ok(receipt.text.includes("assignment pending"));
  assert.ok(!receipt.text.includes("Your assigned counsellor"));
});
