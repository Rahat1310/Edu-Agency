/** Offline, transactional retirement plan. This script never connects to a database. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import retired from "../lib/malaysia/retired-mocks.json";

export const fingerprintFields = [
  "universityName",
  "country",
  "level",
  "field",
  "tuitionAmount",
  "tuitionCurrency",
  "intakeMonths",
  "requirements",
  "scholarshipInfo",
] as const;
export type SnapshotRow = Record<
  (typeof fingerprintFields)[number],
  unknown
> & { id: string; isPublished: boolean };
export function malaysiaFingerprint(row: SnapshotRow) {
  return createHash("sha256")
    .update(
      JSON.stringify(
        Object.fromEntries(fingerprintFields.map((key) => [key, row[key]])),
      ),
    )
    .digest("hex");
}
export function planMalaysiaRetirement(
  rows: SnapshotRow[],
  confirmedRecords: readonly { id: string; fingerprint: string }[] = retired,
) {
  assert.equal(
    new Set(rows.map((r) => r.id)).size,
    rows.length,
    "Duplicate database IDs in snapshot",
  );
  const targets: SnapshotRow[] = [],
    preserved: string[] = [],
    alreadyRetired: string[] = [];
  for (const row of rows) {
    const confirmed = confirmedRecords.find((r) => r.id === row.id);
    if (
      !confirmed ||
      row.country !== "malaysia" ||
      malaysiaFingerprint(row) !== confirmed.fingerprint
    ) {
      preserved.push(row.id);
      continue;
    }
    if (!row.isPublished) alreadyRetired.push(row.id);
    else targets.push(row);
  }
  return { targets, preserved, alreadyRetired };
}
const literal = (v: unknown) =>
  v == null ? "NULL" : `'${String(v).replaceAll("'", "''")}'`;
export function retirementSql(rows: SnapshotRow[]) {
  const plan = planMalaysiaRetirement(rows);
  const columns = [
    "university_name",
    "country",
    "level",
    "field",
    "tuition_amount",
    "tuition_currency",
    "intake_months",
    "requirements",
    "scholarship_info",
  ];
  const updates = plan.targets.map((row) => {
    const guards = fingerprintFields.map((key, i) => {
      const value =
        key === "intakeMonths" && Array.isArray(row[key])
          ? `ARRAY[${(row[key] as string[]).map(literal).join(",")}]::text[]`
          : literal(row[key]);
      return `${columns[i]} IS NOT DISTINCT FROM ${value}${key === "tuitionAmount" ? "::numeric" : ""}`;
    });
    return `UPDATE programs SET is_published = false, updated_at = CURRENT_TIMESTAMP WHERE id = ${literal(row.id)}::uuid AND is_published = true AND ${guards.join(" AND ")};`;
  });
  return `-- Review against a fresh snapshot before the owner's production step.\n-- Exact IDs and original field guards preserve edited and independently verified records.\nBEGIN;\n${updates.join("\n")}\nCOMMIT;\n`;
}
export async function runRetirementPlan(
  snapshotPath: string,
  sqlPath?: string,
) {
  const rows = JSON.parse(
    await readFile(snapshotPath, "utf8"),
  ) as SnapshotRow[];
  const plan = planMalaysiaRetirement(rows);
  if (sqlPath) await writeFile(sqlPath, retirementSql(rows));
  return {
    mode: "offline-dry-run",
    targets: plan.targets.map((r) => r.id),
    preserved: plan.preserved,
    alreadyRetired: plan.alreadyRetired,
    sqlPath: sqlPath ?? null,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const arg = (name: string) => {
    const i = process.argv.indexOf(name);
    return i >= 0 ? process.argv[i + 1] : undefined;
  };
  const snapshot =
    arg("--snapshot") ??
    "imports/malaysia-offers-import/audit/database-before.json";
  runRetirementPlan(snapshot, arg("--write-sql"))
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error: unknown) => {
      console.error(
        error instanceof Error ? error.message : "Retirement plan failed",
      );
      process.exitCode = 1;
    });
}
