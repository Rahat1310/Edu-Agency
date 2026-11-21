import { createHash } from "node:crypto";
import { open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { z } from "zod";
import type { ChinaOffer } from "../lib/china-2027/types";

const root = resolve(import.meta.dirname, "..");
const pack = resolve(root, "imports/china-2027");
const target = resolve(root, "lib/china-2027/offers.json");
const json = async (path: string) => JSON.parse(await readFile(path, "utf8"));
const digest = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");

// Explicit reviewed identities are independent of filenames, mutable fees and copy.
// Existing records are matched by their established UUID; new records have fixed
// UUIDv5 identities derived from university, route and entry year.
const levels = z.enum([
  "foundation",
  "foundation_bachelor",
  "language",
  "bachelor",
  "master",
  "phd",
]);
const strings = z.array(z.string().min(1));
export const incomingSchema = z.array(
  z
    .object({
      id: z.string().uuid(),
      university: z.string().min(1),
      universityId: z.string().min(1),
      identityKey: z.string().min(1),
      entryYear: z.literal(2027),
      entryIntakes: z
        .array(
          z.enum([
            "March 2027",
            "September 2027",
            "Rolling enrollment",
            "Intake to be confirmed",
          ]),
        )
        .min(1),
      sourceRefs: z
        .array(
          z.object({
            file: z.string(),
            sha256: z.string(),
            pages: z.array(z.number().int().positive()).min(1),
          }),
        )
        .min(1),
      location: z.string().min(1),
      level: levels,
      categories: z.array(levels).min(1),
      title: z.string().min(1),
      intake: z.string().min(1),
      intakeStatus: z.enum(["scheduled", "rolling", "unconfirmed"]),
      progressionStart: z.string().min(1).nullable(),
      campus: z.string().min(1).nullable(),
      language: z.enum([
        "English",
        "Chinese",
        "English / Chinese",
        "To be confirmed",
      ]),
      duration: z.string().min(1),
      tuition: z.object({
        amount: z.number().nonnegative().nullable(),
        exact: z.boolean().optional(),
        display: z.string().min(1),
        period: z.enum(["semester", "year", "program"]),
        basis: z.enum(["original", "after-scholarship", "combined"]),
      }),
      fees: z
        .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
        .min(1),
      scholarship: z.object({
        summary: z.string().min(1),
        details: strings,
        available: z.boolean(),
      }),
      majors: strings.min(1),
      requirements: strings.min(1),
      documents: strings.min(1),
      notes: strings,
      deadlines: z
        .array(
          z.object({
            label: z.string().min(1),
            date: z.iso.date().nullable(),
            display: z.string().min(1),
          }),
        )
        .min(1),
      eligibility: z.enum(["eligible", "confirm", "unavailable"]),
      sourceFile: z.string().min(1),
      reviewedOn: z.iso.date(),
      programTerms: z.array(
        z.object({ heading: z.string().min(1), items: strings.min(1) }),
      ),
      reviewRefs: strings,
    })
    .passthrough(),
);

type Source = {
  source_document_id: string;
  pdf_path: string;
  text_path: string;
  pages: number;
  prior_document_intake_assignments: { entry_intake: string }[];
  intake_status?: string;
};

export function reconcileChinaOffers(
  current: ChinaOffer[],
  incoming: ChinaOffer[],
) {
  const byId = new Map(current.map((row) => [row.id, row]));
  assert.equal(
    byId.size,
    current.length,
    "Duplicate existing IDs require explicit review",
  );
  const identityIds = new Map<string, string>();
  const universityNames = new Map<string, string>();
  const nameIds = new Map<string, string>();
  for (const row of [...current, ...incoming]) {
    const normalized = row.university
      .normalize("NFKC")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
    const existingName = universityNames.get(row.universityId);
    assert.ok(
      !existingName || existingName === normalized,
      `University ID collision: ${row.universityId}`,
    );
    universityNames.set(row.universityId, normalized);
    const canonicalId = nameIds.get(normalized);
    assert.ok(
      !canonicalId || canonicalId === row.universityId,
      `University alias needs canonical ID: ${row.university}`,
    );
    nameIds.set(normalized, row.universityId);
    if (!row.identityKey) continue;
    const existingId = identityIds.get(row.identityKey);
    assert.ok(
      !existingId || existingId === row.id,
      `Identity collision: ${row.identityKey}; review before consolidating`,
    );
    identityIds.set(row.identityKey, row.id);
  }
  const added: string[] = [],
    updated: string[] = [],
    alreadyPresent: string[] = [];
  for (const row of incoming) {
    const old = byId.get(row.id);
    if (old) {
      assert.equal(
        row.universityId,
        old.universityId,
        `Cannot move established university reference: ${row.id}`,
      );
    }
    if (!old) added.push(row.id);
    else if (JSON.stringify(old) !== JSON.stringify(row)) updated.push(row.id);
    else alreadyPresent.push(row.id);
    byId.set(row.id, row);
  }
  return {
    offers: [...byId.values()],
    added,
    updated,
    alreadyPresent,
    consolidated: [] as string[],
  };
}

export async function runChinaImport(apply: boolean) {
  // A single catalogue file is the application's authoritative public China store.
  // Atomic replacement means a failed import cannot expose a half-imported pack.
  const lockPath = `${target}.import-lock`;
  const lock = await open(lockPath, "wx");
  const temp = `${target}.${process.pid}.tmp`;
  try {
    const original = await readFile(target, "utf8");
    const current = JSON.parse(original) as ChinaOffer[];
    const manifest = await json(resolve(pack, "manifest.json"));
    const sources = manifest.source_documents as Source[];
    assert.equal(sources.length, 38);
    assert.equal(new Set(sources.map((s) => s.source_document_id)).size, 38);
    for (const source of sources) {
      assert.equal(
        `sha256:${digest(await readFile(resolve(pack, source.pdf_path)))}`,
        source.source_document_id,
        `PDF changed: ${source.pdf_path}`,
      );
      const text = await readFile(resolve(pack, source.text_path), "utf8");
      assert.equal(
        (text.match(/\[Page \d+\]/g) ?? []).length,
        source.pages,
        `Missing pages: ${source.text_path}`,
      );
    }
    const incoming = incomingSchema.parse(
      await json(resolve(pack, "reviewed-offers.json")),
    ) as ChinaOffer[];
    assert.equal(new Set(incoming.map((o) => o.id)).size, incoming.length);
    assert.equal(
      new Set(incoming.map((o) => o.identityKey)).size,
      incoming.length,
    );
    for (const offer of incoming) {
      assert.equal(offer.intake, offer.entryIntakes!.join(" / "));
      assert.ok(
        offer.majors.length &&
          offer.requirements.length &&
          offer.documents.length,
      );
      for (const ref of offer.sourceRefs!) {
        const source = sources.find((s) => s.pdf_path === ref.file);
        assert.ok(source, `Unknown source ${ref.file}`);
        assert.equal(ref.sha256, source.source_document_id);
        assert.ok(ref.pages.every((p) => p <= source.pages));
      }
    }
    const result = reconcileChinaOffers(current, incoming);
    const baseline = (await json(
      resolve(pack, "reconciliation/catalog-before.json"),
    )) as ChinaOffer[];
    const catalogueDelta = reconcileChinaOffers(baseline, incoming);
    const establishedBaselineUniversities = new Set([
      ...baseline.map((o) => o.universityId),
      "zju",
      "nmu",
      "hit",
      "wut",
      "nenu",
    ]);
    const sourceResults = sources.map((source) => {
      const related = incoming.filter((offer) =>
        offer.sourceRefs!.some((ref) => ref.file === source.pdf_path),
      );
      assert.ok(related.length, `Unaccounted source: ${source.pdf_path}`);
      return {
        source: source.pdf_path,
        sha256: source.source_document_id,
        pages: source.pages,
        offers: related.map((offer) => ({
          id: offer.id,
          universityId: offer.universityId,
          status: result.added.includes(offer.id)
            ? "added"
            : result.updated.includes(offer.id)
              ? "updated"
              : "already present",
          requiresReview: offer.eligibility === "confirm",
          entryIntakes: offer.entryIntakes,
          categories: offer.categories,
          reviewRefs: offer.reviewRefs,
        })),
      };
    });
    const currentUniversities = new Set(current.map((o) => o.universityId));
    // HIT is an established featured university and legacy DB institution, reused by ID.
    const establishedUniversities = new Set([
      ...currentUniversities,
      "zju",
      "nmu",
      "hit",
      "wut",
      "nenu",
    ]);
    const addedUniversities = [
      ...new Set(incoming.map((o) => o.universityId)),
    ].filter((id) => !establishedUniversities.has(id));
    const report = {
      mode: apply ? "apply" : "preview",
      sourceSheets: sources.length,
      sourcePages: sources.reduce((n, s) => n + s.pages, 0),
      sourceCoverage: {
        march: sources.filter((s) =>
          s.prior_document_intake_assignments.some(
            (a) => a.entry_intake === "March 2027",
          ),
        ).length,
        september: sources.filter((s) =>
          s.prior_document_intake_assignments.some(
            (a) => a.entry_intake === "September 2027",
          ),
        ).length,
        rollingOrUnconfirmed: sources.filter((s) => s.intake_status).length,
      },
      universities: {
        added: addedUniversities,
        updated: [
          ...new Set(
            incoming
              .filter((o) => result.updated.includes(o.id))
              .map((o) => o.universityId),
          ),
        ],
        consolidated: [],
      },
      offers: {
        added: result.added,
        updated: result.updated,
        consolidated: result.consolidated,
        alreadyPresent: result.alreadyPresent,
        total: result.offers.length,
        requiringReview: incoming
          .filter((o) => o.eligibility === "confirm")
          .map((o) => o.id),
      },
      sourceResults,
      previousHash: digest(original),
      outputHash: digest(JSON.stringify(result.offers, null, 2) + "\n"),
      conflicts: "reconciliation/conflicts.json",
      fieldComparisons: "reconciliation/field-comparisons.json",
      auditFindings: "reconciliation/audit-findings.json",
      reviewedPackHash: digest(JSON.stringify(incoming)),
      catalogueDelta: {
        baselineOffers: baseline.length,
        universitiesAdded: new Set(
          incoming
            .filter((o) => !establishedBaselineUniversities.has(o.universityId))
            .map((o) => o.universityId),
        ).size,
        existingUniversitiesUpdatedOrExpanded: new Set(
          incoming
            .filter((o) => establishedBaselineUniversities.has(o.universityId))
            .map((o) => o.universityId),
        ).size,
        added: catalogueDelta.added.length,
        updated: catalogueDelta.updated.length,
        untouched: baseline.length - catalogueDelta.updated.length,
        consolidated: 0,
        consolidationReason:
          "No verified duplicate persisted records. Chengdu language sections share one canonical route across two source sheets; multi-category and dual-intake sheets reuse offer IDs.",
      },
    };
    if (apply && (result.added.length || result.updated.length)) {
      await writeFile(temp, JSON.stringify(result.offers, null, 2) + "\n");
      assert.equal(
        await readFile(target, "utf8"),
        original,
        "Catalogue changed while importing; retry after review",
      );
      await rename(temp, target);
    }
    const reportPath = resolve(
      pack,
      "reconciliation",
      apply ? "last-run.json" : "preview.json",
    );
    await writeFile(
      `${reportPath}.tmp`,
      JSON.stringify(report, null, 2) + "\n",
    );
    await rename(`${reportPath}.tmp`, reportPath);
    console.log(
      JSON.stringify(
        {
          mode: report.mode,
          universitiesAdded: addedUniversities.length,
          universitiesUpdated: report.universities.updated.length,
          offersAdded: result.added.length,
          offersUpdated: result.updated.length,
          offersConsolidated: result.consolidated.length,
          alreadyPresent: result.alreadyPresent.length,
          offersRequiringReview: report.offers.requiringReview.length,
          totalOffers: result.offers.length,
          sourceSheets: sources.length,
          sourceCoverage: report.sourceCoverage,
          report: reportPath,
        },
        null,
        2,
      ),
    );
    return report;
  } finally {
    await lock.close();
    await unlink(lockPath);
    await unlink(temp).catch(() => undefined);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  runChinaImport(process.argv.includes("--apply")).catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "China import failed",
    );
    process.exitCode = 1;
  });
}
