import assert from "node:assert/strict";
import { test } from "node:test";
import { publicProgramsHref } from "@/lib/programs-href";
import { parsePublicProgramFilters } from "@/lib/programs-public";

test("university selection survives pagination and comparison links in both locales", () => {
  const filters = parsePublicProgramFilters({
    country: "china",
    university: " Nanjing Medical University ",
    page: "2",
  });
  const id = "11111111-1111-4111-8111-111111111111";
  for (const locale of ["en", "bn"] as const) {
    const url = new URL(
      publicProgramsHref(locale, { ...filters, ids: [id] }),
      "https://example.com",
    );
    assert.equal(url.pathname, locale === "bn" ? "/bn/programs" : "/programs");
    assert.equal(
      url.searchParams.get("university"),
      "Nanjing Medical University",
    );
    assert.equal(url.searchParams.get("country"), "china");
    assert.equal(url.searchParams.get("page"), "2");
    assert.equal(url.searchParams.get("ids"), id);
  }
});

test("university names with query characters remain a single filter", () => {
  const name = "University of Science & Technology (China)";
  const url = new URL(
    publicProgramsHref("en", { country: "china", university: name }),
    "https://example.com",
  );
  assert.equal(url.searchParams.get("university"), name);
  assert.deepEqual([...url.searchParams.keys()], ["country", "university"]);
  assert.equal(
    parsePublicProgramFilters({ university: "x".repeat(500) }).university
      ?.length,
    200,
  );
});
