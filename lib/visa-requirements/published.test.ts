import assert from "node:assert/strict";
import { test } from "node:test";

import { publishedVisaRequirements } from "@/lib/visa-requirements/published";

test("unpublished visa requirement rows never appear in the student checklist set", () => {
  const visible = publishedVisaRequirements([
    {
      documentName: "Placeholder — Admission Letter",
      isPublished: true,
      sortOrder: 1,
    },
    {
      documentName: "Draft JW201",
      isPublished: false,
      sortOrder: 0,
    },
    {
      documentName: "Placeholder — Passport copy",
      isPublished: true,
      sortOrder: 0,
    },
  ]);

  assert.deepEqual(
    visible.map((row) => row.documentName),
    [
      "Placeholder — Passport copy",
      "Placeholder — Admission Letter",
    ],
  );
});
