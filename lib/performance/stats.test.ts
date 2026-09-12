import assert from "node:assert/strict";
import { test } from "node:test";

import {
  dhakaMidnightUtc,
  monthStartYmd,
  performanceWindow,
  shiftYmd,
} from "@/lib/performance/range";
import { resolvePerformanceScope } from "@/lib/performance/scope";
import {
  assignedTotal,
  convertedTotal,
  emptyStageCounts,
  isConvertedLeadStatus,
  ratioPercent,
  stageCountsFromRows,
} from "@/lib/performance/stats";

test("this month starts at Dhaka midnight on the 1st", () => {
  const now = new Date("2026-08-16T18:00:00+06:00");
  const window = performanceWindow("this_month", now);
  assert.equal(monthStartYmd("2026-08-16"), "2026-08-01");
  assert.deepEqual(window.from, dhakaMidnightUtc("2026-08-01"));
});

test("last 30 days is inclusive of today in Dhaka", () => {
  const now = new Date("2026-08-16T08:00:00+06:00");
  const window = performanceWindow("last_30_days", now);
  assert.equal(shiftYmd("2026-08-16", -29), "2026-07-18");
  assert.deepEqual(window.from, dhakaMidnightUtc("2026-07-18"));
});

test("all time has no lower bound", () => {
  const window = performanceWindow("all", new Date("2026-08-16T00:00:00Z"));
  assert.equal(window.from, null);
});

test("conversion counts applied and later stages only", () => {
  assert.equal(isConvertedLeadStatus("documents"), false);
  assert.equal(isConvertedLeadStatus("applied"), true);
  assert.equal(isConvertedLeadStatus("departed"), true);

  const counts = stageCountsFromRows([
    { status: "new", total: 4 },
    { status: "applied", total: 2 },
    { status: "visa", total: 1 },
  ]);
  assert.equal(assignedTotal(counts), 7);
  assert.equal(convertedTotal(counts), 3);
  assert.equal(ratioPercent(3, 7), 43);
  assert.equal(ratioPercent(0, 0), null);
  assert.equal(emptyStageCounts.offer, 0);
});

test("a counselor is locked to their own book even if the URL asks for someone else", () => {
  const scope = resolvePerformanceScope({
    role: "counselor",
    userId: "11111111-1111-4111-8111-111111111111",
    requestedCounselorId: "22222222-2222-4222-8222-222222222222",
  });
  assert.deepEqual(scope, {
    counselorId: "11111111-1111-4111-8111-111111111111",
    combined: false,
  });
});

test("an admin can open combined totals or one counselor", () => {
  const adminId = "11111111-1111-4111-8111-111111111111";
  const otherId = "22222222-2222-4222-8222-222222222222";

  assert.deepEqual(
    resolvePerformanceScope({
      role: "admin",
      userId: adminId,
      requestedCounselorId: "all",
    }),
    { counselorId: null, combined: true },
  );
  assert.deepEqual(
    resolvePerformanceScope({
      role: "admin",
      userId: adminId,
      requestedCounselorId: otherId,
    }),
    { counselorId: otherId, combined: false },
  );
});
