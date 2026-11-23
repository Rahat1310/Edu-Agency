import assert from "node:assert/strict";
import { test } from "node:test";
import {
  changeProgramCountry,
  removeProgramFilter,
  programIntakeText,
  programLevelText,
  programReviewLabels,
} from "./programs-directory";
import { publicProgramsHref } from "./programs-href";
import { chinaOffers } from "./china-2027";
import type { PublicProgramFilters } from "./programs-public";

const filters: PublicProgramFilters = {
  country: "china",
  level: "foundation_bachelor",
  field: "engineering",
  page: 4,
  intake: "March 2027",
  university: "xiamen-university",
  language: "English",
  scholarship: true,
};

test("changing country clears dependent choices and keeps the subject search", () => {
  const next = changeProgramCountry(filters, "india");
  assert.equal(next.country, "india");
  assert.equal(next.field, "engineering");
  assert.equal(next.level, "");
  assert.equal(next.page, 1);
  assert.equal(next.university, "");
  assert.equal(next.intake, "");
  assert.equal(next.language, "");
  assert.equal(next.scholarship, false);
  assert.equal(filters.page, 4);
});
test("country changes preserve supported study levels and reset unavailable ones", () => {
  assert.equal(
    changeProgramCountry({ ...filters, level: "bachelor" }, "malaysia").level,
    "bachelor",
  );
  assert.equal(
    changeProgramCountry(
      { ...filters, country: "malaysia", level: "diploma" },
      "china",
    ).level,
    "",
  );
  assert.deepEqual(changeProgramCountry(filters, "china"), filters);
});
test("removing a chip resets pagination while preserving other choices and comparison IDs", () => {
  const next = removeProgramFilter(filters, "language");
  assert.equal(next.page, 1);
  assert.equal(next.language, "");
  assert.equal(next.university, filters.university);
  assert.equal(next.intake, filters.intake);
  assert.equal(next.scholarship, true);
  const id = chinaOffers[0]!.id;
  const url = new URL(
    publicProgramsHref("bn", { ...next, ids: [id] }),
    "https://example.com",
  );
  assert.equal(url.pathname, "/bn/programs");
  assert.equal(url.searchParams.get("ids"), id);
  assert.equal(url.searchParams.has("page"), false);
  assert.equal(url.searchParams.has("language"), false);
  assert.equal(url.searchParams.get("university"), filters.university);
});
test("removing country clears dependent China filters, removing scholarship preserves the country", () => {
  const next = removeProgramFilter(filters, "country");
  assert.equal(next.country, "");
  assert.equal(next.intake, "");
  assert.equal(next.university, "");
  assert.equal(next.language, "");
  assert.equal(next.scholarship, false);
  const scholarship = removeProgramFilter(filters, "scholarship");
  assert.equal(scholarship.country, "china");
  assert.equal(scholarship.scholarship, false);
});
test("entry routes, rolling admission and pending dates retain distinct labels", () => {
  assert.equal(
    programLevelText("foundation_bachelor", "en"),
    "Foundation then bachelor’s",
  );
  assert.notEqual(
    programIntakeText("Rolling enrollment", "bn"),
    programIntakeText("Intake to be confirmed", "bn"),
  );
  assert.equal(programIntakeText("March 2027", "en"), "March 2027");
});
test("review labels identify missing fees or teaching language without implying an award", () => {
  const row = {
    ...chinaOffers[0]!,
    eligibility: "confirm" as const,
    notes: [],
    language: "To be confirmed" as const,
    tuition: {
      ...chinaOffers[0]!.tuition,
      amount: null,
      display: "To be confirmed",
    },
  };
  assert.deepEqual(programReviewLabels(row, "en"), [
    "Teaching language to confirm",
    "Fees to confirm",
  ]);
  assert.deepEqual(
    programReviewLabels({ ...row, eligibility: "eligible" }, "en"),
    [],
  );
  assert.deepEqual(
    programReviewLabels({ ...row, eligibility: "unavailable" }, "en"),
    [],
  );
});
