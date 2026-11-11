import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { programs } from "@/db/schema";
import { CHINA_PROGRAM_CORRECTIONS } from "@/lib/china-program-corrections";

// Preview by default. This updates individual rows without deleting or re-seeding.
async function main() {
  const apply = process.argv.includes("--apply");
  const rows = await db
    .select()
    .from(programs)
    .where(eq(programs.country, "china"));
  const changes = rows.flatMap((row) => {
    const correction = CHINA_PROGRAM_CORRECTIONS.find(
      (item) =>
        item.universityName === row.universityName && item.field === row.field,
    );
    if (!correction) return [];
    const tuitionAmount =
      "tuitionAmount" in correction
        ? correction.tuitionAmount
        : row.tuitionAmount;
    if (
      row.requirements === correction.requirements &&
      row.scholarshipInfo === correction.scholarshipInfo &&
      row.tuitionAmount === tuitionAmount
    )
      return [];
    return [
      {
        row,
        values: {
          requirements: correction.requirements,
          scholarshipInfo: correction.scholarshipInfo,
          tuitionAmount,
        },
      },
    ];
  });
  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "preview",
        changes: changes.map(({ row, values }) => ({
          id: row.id,
          university: row.universityName,
          field: row.field,
          oldTuition: row.tuitionAmount,
          newTuition: values.tuitionAmount,
          requirements: values.requirements,
          scholarshipInfo: values.scholarshipInfo,
        })),
      },
      null,
      2,
    ),
  );
  if (!apply || changes.length === 0) return;
  const backup = join(tmpdir(), `china-programs-before-${Date.now()}.json`);
  await writeFile(
    backup,
    JSON.stringify(
      changes.map(({ row }) => row),
      null,
      2,
    ),
    { mode: 0o600 },
  );
  console.log(`Backup: ${backup}`);
  let updated = 0;
  for (const { row, values } of changes) {
    // Optimistic checks avoid overwriting a staff edit made after the preview read.
    const result = await db
      .update(programs)
      .set({ ...values, updatedAt: new Date() })
      .where(
        and(
          eq(programs.id, row.id),
          eq(programs.country, "china"),
          eq(programs.tuitionAmount, row.tuitionAmount),
          row.requirements === null
            ? isNull(programs.requirements)
            : eq(programs.requirements, row.requirements),
          row.scholarshipInfo === null
            ? isNull(programs.scholarshipInfo)
            : eq(programs.scholarshipInfo, row.scholarshipInfo),
        ),
      )
      .returning({ id: programs.id });
    if (result.length !== 1)
      throw new Error(
        `Program ${row.id} changed during correction. Backup retained; inspect before retrying.`,
      );
    updated++;
  }
  console.log(
    `Corrected ${updated} China programs; IDs and publication status preserved.`,
  );
}

main().catch(() => {
  console.error(
    "China program correction failed. Inspect the preview and backup before retrying; credentials omitted.",
  );
  process.exitCode = 1;
});
