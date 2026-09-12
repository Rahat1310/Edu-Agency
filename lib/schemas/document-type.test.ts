import assert from "node:assert/strict";
import { test } from "node:test";

import { parseDocumentKey } from "@/lib/documents/keys";
import {
  createDocumentUploadIntentSchema,
  documentTypeSchema,
} from "@/lib/schemas/document";
import { validateRequest } from "@/lib/validation-helpers";

const applicationId = "11111111-1111-4111-8111-111111111111";

test("general document types stay on the allow-list", () => {
  const parsed = validateRequest(documentTypeSchema(), "transcript");
  assert.equal(parsed.success, true);
});

test("visa documentTypeKey values are accepted when they are on the allow-list", () => {
  const allowed = documentTypeSchema(["jw201_jw202", "emgs_approval"]);
  const ok = validateRequest(allowed, "jw201_jw202");
  assert.equal(ok.success, true);

  const unknown = validateRequest(allowed, "made_up_visa_form");
  assert.equal(unknown.success, false);
});

test("a visa type is rejected when it is not on the combined allow-list", () => {
  const parsed = validateRequest(
    createDocumentUploadIntentSchema(),
    {
      applicationId,
      type: "jw201_jw202",
      filename: "jw202.pdf",
      contentType: "application/pdf",
      size: 1024,
    },
  );
  assert.equal(parsed.success, false);
});

test("parseDocumentKey accepts destination-specific type slugs", () => {
  const parsed = parseDocumentKey(
    `applications/${applicationId}/jw201_jw202/22222222-2222-4222-8222-222222222222.pdf`,
  );
  assert.equal(parsed?.type, "jw201_jw202");
  assert.equal(parsed?.applicationId, applicationId);
});
