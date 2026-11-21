import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import {
  chinaInstitutions,
  chinaOffers,
  chinaOfferProgram,
  chinaRankingExamples,
  chinaAssessmentIntake,
  getChinaOffer,
  filterChinaOffers,
  parseChinaOfferFilters,
} from "./index";
import { publicProgramsHref } from "@/lib/programs-href";

test("38 source sheets reconcile to routes while retaining the existing catalogue", () => {
  assert.equal(chinaOffers.length, 81);
  assert.equal(chinaInstitutions.length, 51);
  assert.equal(new Set(chinaOffers.map((o) => o.id)).size, 81);
  assert.equal(
    new Set(chinaOffers.flatMap((o) => o.sourceRefs?.map((s) => s.file) ?? []))
      .size,
    38,
  );
  for (const offer of chinaOffers) {
    assert.ok(z.string().uuid().safeParse(offer.id).success);
    assert.ok(
      offer.majors.length > 0 &&
        offer.requirements.length > 0 &&
        offer.documents.length > 0,
    );
    for (const deadline of offer.deadlines) {
      if (deadline.date) assert.ok(Number.isFinite(Date.parse(deadline.date)));
    }
  }
});

test("intake, institution, level, language and subject search intersect correctly", () => {
  assert.equal(filterChinaOffers({ intake: "March 2027" }).length, 61);
  assert.equal(filterChinaOffers({ intake: "September 2027" }).length, 21);
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

test("March pathways do not become September direct degrees", () => {
  const wenzhou = filterChinaOffers({
    university: "wenzhou-medical-university",
  });
  assert.equal(wenzhou.length, 2);
  assert.ok(wenzhou.every((o) => o.progressionStart === "September 2027"));
  assert.equal(
    filterChinaOffers({
      university: "wenzhou-medical-university",
      intake: "September 2027",
    }).length,
    0,
  );
  assert.equal(
    filterChinaOffers({
      university: "wenzhou-medical-university",
      intake: "March 2027",
    }).length,
    2,
  );
  const fujian = filterChinaOffers({
    university: "fujian-medical-university",
    intake: "September 2027",
  });
  assert.equal(fujian.length, 2);
  assert.ok(fujian.every((o) => o.level === "bachelor"));
});

test("shared intake offers appear once per list and retain both memberships", () => {
  for (const id of [
    "chengdu-normal-university",
    "hebei-academy-of-fine-arts",
    "hunan-college-of-foreign-studies",
  ]) {
    const all = filterChinaOffers({ university: id });
    for (const intake of ["March 2027", "September 2027"]) {
      const matches = filterChinaOffers({ university: id, intake });
      assert.equal(new Set(matches.map((o) => o.id)).size, matches.length);
      assert.ok(matches.every((o) => all.some((a) => a.id === o.id)));
    }
  }
  const shared = filterChinaOffers({
    university: "chengdu-normal-university",
    level: "language",
  });
  assert.equal(shared.length, 1);
  assert.equal(shared[0]!.sourceRefs!.length, 2);
  assert.deepEqual(chinaOfferProgram(shared[0]!).intakeMonths, [
    "March 2027",
    "September 2027",
  ]);
});

test("rolling and unconfirmed entries stay distinguishable through filters and consultation", () => {
  const rolling = filterChinaOffers({ intake: "Rolling enrollment" });
  assert.equal(rolling.length, 1);
  assert.equal(
    rolling[0]!.universityId,
    "wuhan-vocational-college-of-commerce-and-trade",
  );
  const pending = filterChinaOffers({ intake: "Intake to be confirmed" });
  assert.equal(pending.length, 2);
  for (const o of [...rolling, ...pending]) {
    assert.equal(chinaAssessmentIntake(o), "");
    assert.ok(!filterChinaOffers({ intake: "March 2027" }).includes(o));
  }
  const shared = chinaOffers.find((o) => o.entryIntakes?.length === 2)!;
  assert.equal(chinaAssessmentIntake(shared), "");
  assert.equal(
    chinaAssessmentIntake(
      chinaOffers.find(
        (o) => o.entryIntakes?.length === 1 && o.intake === "March 2027",
      )!,
    ),
    "2027-03",
  );
  assert.equal(
    parseChinaOfferFilters({ country: "china", intake: "Rolling enrollment" })
      .intake,
    "Rolling enrollment",
  );
});

test("similar institution names and documented intake-specific offers remain distinct", () => {
  assert.equal(
    filterChinaOffers({ university: "changchun-sci-tech-university" })[0]!
      .level,
    "foundation_bachelor",
  );
  assert.equal(
    filterChinaOffers({
      university: "changchun-university-of-science-and-technology",
    })[0]!.level,
    "master",
  );
  assert.ok(
    filterChinaOffers({ university: "shenyang-city-university" }).every(
      (o) => o.university === "Shenyang City University",
    ),
  );
  assert.ok(
    filterChinaOffers({ university: "wuhan-university" }).every(
      (o) => o.university === "Wuhan University",
    ),
  );
  const hust = filterChinaOffers({
    university: "huazhong-university-of-science-and-technology",
    level: "language",
  });
  assert.equal(hust.length, 4);
  assert.equal(new Set(hust.map((o) => o.id)).size, 4);
});

test("multi-category pathways return once and established detail URLs survive", () => {
  const baseline = "81e308a7-25f8-5ba7-8fba-a47f5d2d8f02";
  assert.equal(
    getChinaOffer(baseline)!.universityId,
    "civil-aviation-university-of-china",
  );
  const matches = filterChinaOffers({
    university: "wenzhou-medical-university",
    level: "bachelor",
  });
  assert.equal(matches.length, 1);
  assert.equal(new Set(matches.map((o) => o.id)).size, 1);
});

test("reviewed fees use the normal panel and incumbent admission terms survive omissions", () => {
  for (const offer of chinaOffers.filter((o) => o.sourceRefs?.length)) {
    assert.ok(offer.fees.length > 0, offer.title);
    assert.ok(
      offer.documents.every((d) => !d.includes("•")),
      offer.title,
    );
  }
  const cauc = getChinaOffer("81e308a7-25f8-5ba7-8fba-a47f5d2d8f02")!;
  assert.equal(cauc.deadlines[0]!.date, "2027-01-06");
  assert.deepEqual(cauc.entryIntakes, ["March 2027"]);
  assert.match(cauc.requirements.join(" "), /60%/);
  assert.match(cauc.requirements.join(" "), /17 or 18/);
  const scut = getChinaOffer("133600ca-3865-56f6-9e28-e665421cd1f0")!;
  assert.equal(scut.deadlines[0]!.date, "2026-12-31");
  assert.match(scut.fees[0]!.value, /8,000/);
});
