import assert from "node:assert/strict";
import test from "node:test";
import {
  malaysiaFingerprint,
  planMalaysiaRetirement,
  retirementSql,
  type SnapshotRow,
} from "./reconcile-malaysia";
const row: SnapshotRow = {
  id: "0148f6e0-c427-47d1-ae7a-241b317e75f7",
  universityName: "Mock APU",
  country: "malaysia",
  level: "bachelor",
  field: "Mock AI",
  tuitionAmount: "34000.00",
  tuitionCurrency: "MYR",
  intakeMonths: ["March"],
  requirements: "Mock entry",
  scholarshipInfo: "Mock award",
  isPublished: true,
};
const confirmed = [{ id: row.id, fingerprint: malaysiaFingerprint(row) }];
test("retirement is exact, guarded, preserves verified edits and is idempotent", () => {
  assert.equal(planMalaysiaRetirement([row], confirmed).targets.length, 1);
  assert.equal(
    planMalaysiaRetirement([{ ...row, tuitionAmount: "34900.00" }], confirmed)
      .preserved.length,
    1,
  );
  assert.equal(
    planMalaysiaRetirement([{ ...row, country: "india" }], confirmed).targets
      .length,
    0,
  );
  assert.equal(
    planMalaysiaRetirement(
      [{ ...row, id: "12345678-1234-4234-8234-123456789abc" }],
      confirmed,
    ).targets.length,
    0,
  );
  assert.equal(
    planMalaysiaRetirement([{ ...row, isPublished: false }], confirmed)
      .alreadyRetired.length,
    1,
  );
  assert.throws(
    () => planMalaysiaRetirement([row, row], confirmed),
    /Duplicate/,
  );
  const sql = retirementSql([]);
  assert.match(sql, /BEGIN;/);
  assert.match(sql, /COMMIT;/);
  assert.doesNotMatch(sql, /DELETE|DROP|TRUNCATE/);
});
