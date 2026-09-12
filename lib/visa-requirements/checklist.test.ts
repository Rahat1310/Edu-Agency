import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildVisaChecklist,
  visaChecklistUploadHref,
} from "@/lib/visa-requirements/checklist";

function requirement(
  overrides: Partial<{
    id: string;
    documentTypeKey: string;
    documentName: string;
    description: string | null;
    sortOrder: number;
    isPublished: boolean;
  }> & { id: string; documentTypeKey: string; documentName: string },
) {
  return {
    description: null,
    sortOrder: 0,
    isPublished: true,
    ...overrides,
  };
}

test("checklist keeps published requirements in sortOrder, then name", () => {
  const checklist = buildVisaChecklist(
    [
      requirement({
        id: "b",
        documentTypeKey: "admission_letter",
        documentName: "Admission letter",
        sortOrder: 2,
      }),
      requirement({
        id: "a",
        documentTypeKey: "jw201_jw202",
        documentName: "JW201 / JW202",
        sortOrder: 0,
      }),
      requirement({
        id: "c",
        documentTypeKey: "x1_x2_visa",
        documentName: "X1 / X2 visa",
        sortOrder: 1,
      }),
    ],
    [],
  );

  assert.deepEqual(
    checklist.items.map((item) => item.documentTypeKey),
    ["jw201_jw202", "x1_x2_visa", "admission_letter"],
  );
  assert.equal(checklist.total, 3);
  assert.equal(checklist.submittedCount, 0);
});

test("unpublished requirements never appear on the student checklist", () => {
  const checklist = buildVisaChecklist(
    [
      requirement({
        id: "pub",
        documentTypeKey: "passport_copy",
        documentName: "Passport copy",
        isPublished: true,
      }),
      requirement({
        id: "draft",
        documentTypeKey: "jw201_jw202",
        documentName: "Draft JW201",
        isPublished: false,
      }),
    ],
    [{ type: "jw201_jw202", status: "approved" }],
  );

  assert.deepEqual(
    checklist.items.map((item) => item.documentTypeKey),
    ["passport_copy"],
  );
  assert.equal(checklist.items[0]?.status, "missing");
});

test("items match uploaded documents by documentTypeKey, not a similar general type", () => {
  const checklist = buildVisaChecklist(
    [
      requirement({
        id: "copy",
        documentTypeKey: "passport_copy",
        documentName: "Passport copy",
      }),
    ],
    [
      { type: "passport", status: "approved" },
      { type: "passport_copy", status: "pending" },
    ],
  );

  assert.equal(checklist.items[0]?.status, "pending");
  assert.equal(checklist.submittedCount, 1);
});

test("approved wins over pending or rejected for the same type", () => {
  const checklist = buildVisaChecklist(
    [
      requirement({
        id: "letter",
        documentTypeKey: "admission_letter",
        documentName: "Admission letter",
      }),
    ],
    [
      { type: "admission_letter", status: "rejected" },
      { type: "admission_letter", status: "pending" },
      { type: "admission_letter", status: "approved" },
    ],
  );

  assert.equal(checklist.items[0]?.status, "approved");
  assert.equal(checklist.submittedCount, 1);
});

test("pending and approved count as submitted; missing and rejected do not", () => {
  const checklist = buildVisaChecklist(
    [
      requirement({
        id: "1",
        documentTypeKey: "a",
        documentName: "A",
        sortOrder: 0,
      }),
      requirement({
        id: "2",
        documentTypeKey: "b",
        documentName: "B",
        sortOrder: 1,
      }),
      requirement({
        id: "3",
        documentTypeKey: "c",
        documentName: "C",
        sortOrder: 2,
      }),
      requirement({
        id: "4",
        documentTypeKey: "d",
        documentName: "D",
        sortOrder: 3,
      }),
    ],
    [
      { type: "a", status: "approved" },
      { type: "b", status: "pending" },
      { type: "c", status: "rejected" },
    ],
  );

  assert.equal(checklist.submittedCount, 2);
  assert.equal(checklist.total, 4);
  assert.deepEqual(
    checklist.items.map((item) => item.status),
    ["approved", "pending", "rejected", "missing"],
  );
});

test("a destination with zero published requirements yields an empty checklist", () => {
  const checklist = buildVisaChecklist(
    [
      requirement({
        id: "draft",
        documentTypeKey: "emgs_approval",
        documentName: "EMGS",
        isPublished: false,
      }),
    ],
    [{ type: "emgs_approval", status: "pending" }],
  );

  assert.equal(checklist.total, 0);
  assert.deepEqual(checklist.items, []);
});

test("upload href pre-fills the documents page with the requirement type", () => {
  assert.equal(
    visaChecklistUploadHref("jw201_jw202"),
    "/portal/documents?type=jw201_jw202#document-type-jw201_jw202",
  );
});
