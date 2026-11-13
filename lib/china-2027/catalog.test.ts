import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import {
  chinaInstitutions,
  chinaOffers,
  chinaOfferProgram,
  chinaRankingExamples,
  filterChinaOffers,
  parseChinaOfferFilters,
} from "./index";
import { publicProgramsHref } from "@/lib/programs-href";

test("the catalogue has 57 distinct offers across 35 institutions", () => {
  assert.equal(chinaOffers.length, 57);
  assert.equal(chinaInstitutions.length, 35);
  assert.equal(new Set(chinaOffers.map((o) => o.id)).size, 57);
  assert.equal(new Set(chinaOffers.map((o) => o.sourceFile)).size, 57);
  const offerKeys = chinaOffers.map((offer) =>
    [
      offer.universityId,
      offer.intake,
      offer.level,
      offer.language,
      offer.title,
    ].join("|"),
  );
  assert.equal(new Set(offerKeys).size, 57);
  for (const offer of chinaOffers) {
    assert.ok(z.string().uuid().safeParse(offer.id).success);
    assert.match(
      offer.sourceFile,
      /^(March|September) 2027\/.+(?:\.docx?|\.pdf#pages=\d+(?:-\d+)?)$/,
    );
    assert.equal(
      offer.intake,
      offer.sourceFile.startsWith("March") ? "March 2027" : "September 2027",
    );
    assert.ok(offer.majors.length > 0 && offer.requirements.length > 0);
    for (const deadline of offer.deadlines) {
      if (deadline.date) assert.ok(Number.isFinite(Date.parse(deadline.date)));
    }
  }
});

test("each March guide entry maps to one offer and every continuation page is covered", () => {
  const imported = chinaOffers.filter((o) => o.reviewedOn === "2026-11-12");
  assert.equal(imported.length, 20);
  assert.equal(imported.filter((o) => o.supplementalSource).length, 3);
  const coveredPages: number[] = [];
  for (const offer of imported) {
    assert.equal(offer.intake, "March 2027");
    const source = offer.supplementalSource ?? offer.sourceFile;
    const match = source.match(
      /China_March_Intake_2027_University_Offer\.pdf#pages=(\d+)(?:-(\d+))?$/,
    );
    assert.ok(match);
    const first = Number(match[1]);
    const last = Number(match[2] ?? match[1]);
    for (let page = first; page <= last; page++) coveredPages.push(page);
  }
  assert.deepEqual(
    coveredPages.sort((a, b) => a - b),
    Array.from({ length: 29 }, (_, i) => i + 2),
  );
  for (const [university, level] of [
    ["hechi-university", "language"],
    ["hangzhou-dianzi-university", "foundation"],
    ["south-china-university-of-technology", "language"],
  ] as const) {
    const matching = filterChinaOffers({
      university,
      intake: "March 2027",
      level,
    });
    assert.equal(matching.length, 1);
    assert.ok(matching[0]?.supplementalSource);
  }
});

test("conflicting dates and progression references are not treated as confirmed intake dates", () => {
  const hdu = filterChinaOffers({
    university: "hangzhou-dianzi-university",
    intake: "March 2027",
  })[0]!;
  assert.equal(hdu.language, "English / Chinese");
  assert.equal(hdu.eligibility, "confirm");
  assert.ok(hdu.deadlines.every((deadline) => deadline.date === null));
  assert.match(
    hdu.deadlines.map((deadline) => deadline.display).join(" "),
    /30 December 2027/,
  );
  const nantong = filterChinaOffers({
    university: "nantong-university",
    intake: "March 2027",
  });
  assert.equal(nantong.length, 2);
  assert.match(
    nantong
      .find((o) => o.level === "foundation_bachelor")!
      .requirements.join(" "),
    /September 2027 bachelor intake/,
  );
  assert.match(
    nantong.find((o) => o.level === "master")!.notes.join(" "),
    /progression intake require university confirmation/,
  );
  assert.equal(
    filterChinaOffers({
      university: "nantong-university",
      intake: "September 2027",
    }).length,
    0,
  );
});

test("intake, institution, level, language and subject search intersect correctly", () => {
  assert.equal(filterChinaOffers({ intake: "March 2027" }).length, 43);
  assert.equal(filterChinaOffers({ intake: "September 2027" }).length, 14);
  const matches = filterChinaOffers({
    country: "china",
    intake: "September 2027",
    university: "xiamen-university",
    level: "master",
    language: "English",
    field: "chemical engineering",
  });
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.language, "English");
  assert.equal(filterChinaOffers({ country: "india" }).length, 0);
  assert.equal(filterChinaOffers({ field: "no-such-subject-4821" }).length, 0);
});

test("China-specific filters are allowlisted and cleared when the country changes", () => {
  const valid = {
    country: "china",
    intake: "September 2027",
    university: "xiamen-university",
    language: "English",
    scholarship: "1",
  };
  assert.deepEqual(parseChinaOfferFilters(valid), {
    intake: "September 2027",
    university: "xiamen-university",
    language: "English",
    scholarship: true,
  });
  assert.deepEqual(parseChinaOfferFilters({ ...valid, country: "india" }), {
    intake: "",
    university: "",
    language: "",
    scholarship: false,
  });
  assert.deepEqual(parseChinaOfferFilters({ ...valid, country: "" }), {
    intake: "",
    university: "",
    language: "",
    scholarship: false,
  });
  assert.deepEqual(
    parseChinaOfferFilters({
      country: "china",
      intake: "March 2026",
      university: "unapproved-university",
      language: "French",
      scholarship: "yes",
    }),
    { intake: "", university: "", language: "", scholarship: false },
  );
});

test("unknown and combined fees retain their meaning in directory and compare data", () => {
  const unknown = chinaOffers.find(
    (o) =>
      o.universityId === "xi-an-jiaotong-university" &&
      o.language === "English",
  )!;
  assert.equal(unknown.tuition.amount, null);
  assert.equal(chinaOfferProgram(unknown).tuitionAmount, "");
  assert.match(chinaOfferProgram(unknown).tuitionDisplay!, /Confirm tuition/);
  const combined = chinaOffers.find(
    (o) => o.university === "Xingtai University",
  )!;
  assert.equal(combined.tuition.basis, "combined");
  assert.match(
    chinaOfferProgram(combined).tuitionDisplay!,
    /tuition \+ housing/,
  );
});

test("country restrictions and limited scholarship durations remain explicit", () => {
  const restricted = chinaOffers.find((o) =>
    o.university.startsWith("Harbin Far East"),
  )!;
  assert.equal(restricted.eligibility, "unavailable");
  assert.match(restricted.requirements.join(" "), /NOT OPEN TO BANGLADESHI/);
  for (const offer of chinaOffers.filter(
    (o) => o.university === "Xiamen University",
  )) {
    assert.match(offer.scholarship.details.join(" "), /first-year|first year/i);
    assert.match(offer.scholarship.details.join(" "), /annual review/);
    assert.equal(offer.deadlines.length, 2);
  }
});

test("ranking and localized filter links resolve to institutions in the approved inventory", () => {
  for (const university of chinaRankingExamples) {
    assert.ok(filterChinaOffers({ university: university.id }).length > 0);
  }
  const url = new URL(
    publicProgramsHref("bn", {
      country: "china",
      intake: "September 2027",
      language: "English",
      scholarship: true,
      university: "xiamen-university",
      page: 2,
    }),
    "https://example.org",
  );
  assert.equal(url.pathname, "/bn/programs");
  assert.equal(url.searchParams.get("intake"), "September 2027");
  assert.equal(url.searchParams.get("language"), "English");
  assert.equal(url.searchParams.get("university"), "xiamen-university");
  assert.equal(url.searchParams.get("scholarship"), "1");
  assert.equal(url.searchParams.get("page"), "2");
});
