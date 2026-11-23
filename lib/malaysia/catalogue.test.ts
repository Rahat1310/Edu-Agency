import assert from "node:assert/strict";
import test from "node:test";
import {
  filterMalaysiaProgrammes,
  getMalaysiaSchedules,
  malaysiaCatalogue,
  malaysiaProgrammeCard,
  retiredMalaysiaIds,
} from "./index";
import { localizedHref } from "../i18n/paths";
import { parseCompareIds } from "../programs-compare";

const { institutions, programmes, schedules } = malaysiaCatalogue;
const amount = (value: string) => value.replace(/[\s,]/g, "");
function sourceSchedules(id: string, title: RegExp) {
  const ids = programmes
    .filter((p) => title.test(p.title))
    .flatMap((p) => p.scheduleIds);
  return schedules.filter(
    (s) => ids.includes(s.id) && s.refs.some((r) => r.id === id),
  );
}
function hasPrice(id: string, title: RegExp, price: string) {
  return sourceSchedules(id, title).some((s) =>
    s.tables.some((t) =>
      t.rows.some((r) => r.some((c) => amount(c).includes(amount(price)))),
    ),
  );
}
test("identities, schedule keys and programme links are unique and non-orphaned", () => {
  assert.equal(institutions.length, 31);
  assert.equal(new Set(programmes.map((p) => p.id)).size, programmes.length);
  assert.equal(
    new Set(programmes.map((p) => p.identityKey)).size,
    programmes.length,
  );
  assert.equal(new Set(schedules.map((s) => s.id)).size, schedules.length);
  for (const p of programmes) {
    assert.ok(institutions.some((i) => i.id === p.institutionId));
    assert.ok(p.scheduleIds.length);
    assert.equal(new Set(p.scheduleIds).size, p.scheduleIds.length);
    assert.equal(getMalaysiaSchedules(p).length, p.scheduleIds.length);
    assert.deepEqual(parseCompareIds(p.id), [p.id]);
    assert.ok(!retiredMalaysiaIds.includes(p.id));
    assert.equal(
      localizedHref(`/programs/${p.id}`, "bn"),
      `/bn/programs/${p.id}`,
    );
  }
  for (const s of schedules) {
    assert.ok(programmes.some((p) => p.scheduleIds.includes(s.id)));
    assert.ok(s.refs.length && s.tables.length);
    assert.ok(["historical", "confirmation-required"].includes(s.status));
    for (const t of s.tables)
      for (const row of t.rows)
        assert.equal(row.length, t.headers.length, `${s.id} ${t.caption}`);
  }
});
test("source check prices retain separate bases, currencies and eligibility", () => {
  for (const [source, title, price] of [
    ["MY-002", /PhD in Business Administration/i, "60,800.00"],
    ["MY-002", /PhD in Business Administration/i, "45,800.00"],
    ["MY-024", /software engineering/i, "91,340.00"],
    ["MY-090", /software engineering/i, "105,900.00"],
    ["MY-024", /software engineering/i, "87,420.00"],
    ["MY-113", /Medical Anatomy/i, "59,200"],
    ["MY-119", /PHILOSOPHY IN MANAGEMENT/i, "12,748"],
    ["MY-124", /BUSINESS ADMINISTRATION \(MBA\)/i, "30,240"],
    ["MY-127", /Intensive English/i, "5,000"],
    ["MY-131", /School transport/i, "320.00"],
    ["MY-134", /Degree subject group.*Artificial Intelligence/i, "34,900"],
    ["MY-138", /Foundation in Business/i, "21,931"],
    ["MY-140", /Applied Artificial Intelligence/i, "77,250"],
    ["MY-144", /CAMBRIDGE GCE ADVANCED LEVEL/i, "44,375"],
    ["MY-148", /Diploma in Nursing/i, "59,955"],
    ["MY-148", /Diploma in Nursing/i, "17,175"],
  ] as const)
    assert.ok(hasPrice(source, title, price), `${source}: ${price}`);
  assert.match(
    JSON.stringify(sourceSchedules("MY-119", /PHILOSOPHY IN MANAGEMENT/i)),
    /USD/,
  );
  const inti = programmes.filter(
    (p) =>
      p.institutionId === "inti" &&
      /Foundation in (Business|Arts|Science|Information Technology)$/.test(
        p.title,
      ) &&
      p.campus === "Nilai",
  );
  assert.equal(inti.length, 4);
  for (const p of inti)
    assert.ok(
      getMalaysiaSchedules(p).some((s) => JSON.stringify(s).includes("21,931")),
    );
});
test("dated, audience and conflicting variants survive deduplication", () => {
  const management = programmes.find(
    (p) =>
      p.institutionId === "lincoln" &&
      p.title === "Doctor of Philosophy (PhD) in Management" &&
      p.mode === "Research",
  )!;
  const variants = getMalaysiaSchedules(management);
  assert.equal(variants.length, 2);
  assert.ok(variants.some((s) => JSON.stringify(s).includes("54,200")));
  assert.ok(variants.some((s) => JSON.stringify(s).includes("47,000")));
  assert.ok(
    schedules.some(
      (s) =>
        s.refs.some((r) => r.id === "MY-007") &&
        s.refs.some((r) => r.id === "MY-058"),
    ),
  );
  assert.equal(
    programmes.filter(
      (p) =>
        p.institutionId === "cyberjaya" &&
        p.title === "Master of Business Administration (MBA)",
    ).length,
    2,
  );
  assert.ok(
    schedules.some(
      (s) =>
        s.refs.some((r) => r.id === "MY-123") &&
        s.status === "historical" &&
        /2025/.test(s.period),
    ),
  );
});
test("original layout boundaries preserve foundation rows, professional levels and changing SEGi columns", () => {
  assert.equal(
    programmes.filter((p) => p.institutionId === "unirazak").length,
    36,
  );
  assert.ok(hasPrice("MY-121", /^Foundation in Arts$/, "29,000"));
  for (const title of [
    "Doctor of Medicine (MD )",
    "Doctor of Dental Surgery (DDS)",
  ]) {
    assert.equal(
      programmes.find((p) => p.institutionId === "lincoln" && p.title === title)
        ?.level,
      "bachelor",
    );
  }
  const psychology = sourceSchedules(
    "MY-142",
    /^MASTER OF SOCIAL SCIENCE IN PSYCHOLOGY$/,
  )[0];
  assert.ok(psychology.refs.some((r) => r.page === "6"));
  assert.deepEqual(
    psychology.tables[0].rows.find((r) => r[0] === "Grand total fees"),
    ["Grand total fees", "55,411.00"],
  );
  assert.deepEqual(
    psychology.tables[0].rows.find((r) => r[0] === "Upon registration"),
    ["Upon registration", "3,860.00"],
  );
  assert.ok(
    psychology.tables[1].rows.some(
      (r) => r.join("|") === "Facilities|3,000|180.00",
    ),
  );
  assert.ok(
    psychology.tables[1].rows.some(
      (r) => r.join("|") === "Security Deposit|300|0",
    ),
  );
});
test("search and supported filters expose each university record without pagination loss", () => {
  const shared = filterMalaysiaProgrammes({ country: "malaysia" });
  for (const p of shared) {
    assert.ok(
      filterMalaysiaProgrammes({
        country: "malaysia",
        field: p.title,
        university: p.institutionId,
        level: [
          "bachelor",
          "master",
          "phd",
          "diploma",
          "foundation",
          "language",
        ].includes(p.level)
          ? (p.level as "bachelor")
          : "",
      }).some((r) => r.id === p.id),
    );
  }
  assert.deepEqual(filterMalaysiaProgrammes({ country: "india" }), []);
  assert.deepEqual(
    filterMalaysiaProgrammes({
      country: "malaysia",
      field: "__no_such_course__",
    }),
    [],
  );
});
test("Taylor merged graphic cells retain currencies, complete titles and exact intake variants", () => {
  const business = sourceSchedules(
    "MY-145",
    /^Bachelor of Business \(Hons\)$/,
  )[0];
  assert.deepEqual(business.tables[0].rows, [
    ["February", "2 years 11 months", "159,859", "39,965"],
    ["April", "2 years 9 months", "159,859", "39,965"],
    ["September", "2 years 10 months", "159,859", "39,965"],
  ]);
  assert.ok(
    hasPrice(
      "MY-145",
      /^Bachelor of Medicine, Bachelor of Surgery \(MBBS\)$/,
      "511,422",
    ),
  );
  assert.ok(
    hasPrice(
      "MY-145",
      /^Advanced Diploma in Patisserie & Gastronomic Cuisine$/,
      "54,851",
    ),
  );
  assert.ok(
    hasPrice("MY-145", /^Doctor of Business Administration$/, "98,103"),
  );
  assert.ok(
    hasPrice("MY-145", /^Bachelor of Food Science \(Hons\)$/, "151,273"),
  );
  const applied = sourceSchedules("MY-145", /^Master of Applied Computing$/)[0];
  assert.deepEqual(
    applied.tables[0].rows.find((r) => r[0] === "September"),
    [
      "September",
      "1 Months (printed; requires confirmation)",
      "67,949",
      "16,987",
    ],
  );
  assert.ok(
    !programmes.some(
      (p) =>
        p.institutionId === "taylors" &&
        /SCHOOL OF|^DIPLOMA STUDIES$|^Postgraduate$/.test(p.title),
    ),
  );
});
test("MILA open grid borders do not join programmes or omit last payments", () => {
  assert.equal(programmes.filter((p) => p.institutionId === "mila").length, 25);
  const biotech = sourceSchedules(
    "MY-117",
    /^Bachelor of Science \(Biotechnology\) \(Hons\)$/,
  )[0];
  assert.equal(biotech.tables[0].rows.length, 7);
  assert.deepEqual(biotech.tables[0].rows[6].slice(-4), [
    "1,800",
    "750",
    "600",
    "3,150",
  ]);
  const phd = sourceSchedules(
    "MY-117",
    /^Doctor of Philosophy in Engineering/,
  )[0];
  assert.equal(phd.tables[0].rows.length, 6);
  assert.deepEqual(
    phd.tables[0].rows.map((r) => r.at(-1)),
    ["16000", "9000", "10500", "9000", "9500", "8000"],
  );
  const dba = sourceSchedules(
    "MY-117",
    /^Doctorate of Business Administration/,
  )[0];
  assert.equal(dba.tables[0].rows.length, 15);
  assert.equal(dba.tables[0].rows[5].at(-1), "7750");
  const accounting = sourceSchedules("MY-117", /^Bachelor of Accounting/)[0];
  assert.equal(accounting.tables[0].rows.length, 7);
  const mass = sourceSchedules("MY-117", /^Bachelor of Mass Communication/)[0];
  assert.equal(mass.tables[0].rows.length, 7);
  assert.equal(mass.tables[0].rows[6].at(-1), "2,250");
});
test("comparison never annualises fees and public payload excludes private originals and routing", () => {
  for (const p of programmes) {
    const card = malaysiaProgrammeCard(p);
    assert.equal(card.tuitionAmount, "");
    assert.ok(
      card.comparisonFeeDisplay?.includes("Basis") ||
        card.comparisonFeeDisplay?.length,
    );
  }
  const serialized = JSON.stringify(malaysiaCatalogue);
  assert.doesNotMatch(
    serialized,
    /Account No|A\/C No|Swift Code|8002883456|ALL FEES\/|words_bbox|layout_text|imports\//i,
  );
  assert.ok(!institutions.some((i) => /Nottingham/.test(i.name)));
  assert.ok(
    !schedules.some((s) =>
      s.refs.some((r) => ["MY-114", "MY-128", "MY-129"].includes(r.id)),
    ),
  );
});
