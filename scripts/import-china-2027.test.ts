import assert from "node:assert/strict";
import { test } from "node:test";
import baseline from "../imports/china-2027/reconciliation/catalog-before.json";
import reviewed from "../imports/china-2027/reviewed-offers.json";
import current from "../lib/china-2027/offers.json";
import firstRun from "../imports/china-2027/reconciliation/first-run.json";
import secondRun from "../imports/china-2027/reconciliation/second-run.json";
import finalizationRun from "../imports/china-2027/reconciliation/finalization-run.json";
import { incomingSchema, reconcileChinaOffers } from "./import-china-2027";
import type { ChinaOffer } from "../lib/china-2027/types";

const incoming = reviewed as ChinaOffer[];
test("import upserts established IDs and is a no-op on the second pass", () => {
  const first = reconcileChinaOffers(baseline as ChinaOffer[], incoming);
  assert.equal(first.added.length, 41);
  assert.equal(first.updated.length, 7);
  assert.equal(first.consolidated.length, 0);
  for (const row of baseline) {
    const next = first.offers.find((o) => o.id === row.id)!;
    assert.ok(next);
    assert.equal(next.sourceFile, row.sourceFile);
    assert.equal(next.universityId, row.universityId);
  }
  const again = reconcileChinaOffers(first.offers, incoming);
  assert.equal(again.added.length, 0);
  assert.equal(again.updated.length, 0);
  assert.deepEqual(again.offers, first.offers);
  assert.deepEqual(again.offers, current);
});
test("retry after a partial older update converges without duplicate records", () => {
  const partly = reconcileChinaOffers(
    baseline as ChinaOffer[],
    incoming.slice(0, 12),
  );
  const retried = reconcileChinaOffers(partly.offers, incoming);
  assert.deepEqual(
    retried.offers.map((o) => o.id).sort(),
    current.map((o) => o.id).sort(),
  );
  const final = reconcileChinaOffers(retried.offers, incoming);
  assert.equal(final.updated.length + final.added.length, 0);
});

test("renamed sources, wording and changed fees update the established identity", () => {
  const existing = incoming[0]!;
  const revised = {
    ...existing,
    sourceFile: "renamed-revision.pdf",
    title: `${existing.title} — revised wording`,
    tuition: { ...existing.tuition, amount: 6100 },
  };
  const result = reconcileChinaOffers([existing], [revised]);
  assert.deepEqual(result.added, []);
  assert.deepEqual(result.updated, [existing.id]);
  assert.equal(result.offers.length, 1);
  assert.equal(result.offers[0]!.id, existing.id);
});
test("identity collisions and university ID collisions fail before any mutation", () => {
  const row = incoming[0]!;
  assert.throws(
    () => reconcileChinaOffers([row], [{ ...row, id: incoming[1]!.id }]),
    /Identity collision/,
  );
  assert.throws(
    () =>
      reconcileChinaOffers(
        [row],
        [{ ...row, university: "Distinct institution" }],
      ),
    /University ID collision/,
  );
  assert.throws(
    () => reconcileChinaOffers([row, row], []),
    /Duplicate existing IDs/,
  );
});
test("the two actual import runs account for every source and preserve bytes", () => {
  assert.equal(firstRun.sourceSheets, 38);
  assert.equal(firstRun.sourcePages, 46);
  assert.deepEqual(firstRun.sourceCoverage, {
    march: 33,
    september: 5,
    rollingOrUnconfirmed: 4,
  });
  assert.ok(firstRun.sourceResults.every((s) => s.offers.length));
  assert.equal(secondRun.offers.added.length, 0);
  assert.equal(secondRun.offers.updated.length, 0);
  assert.equal(firstRun.outputHash, finalizationRun.previousHash);
  assert.equal(finalizationRun.outputHash, secondRun.previousHash);
  assert.equal(secondRun.previousHash, secondRun.outputHash);
});

test("incomplete or malformed financial and source records fail validation", () => {
  assert.equal(incomingSchema.safeParse(incoming).success, true);
  assert.equal(
    incomingSchema.safeParse([{ ...incoming[0], fees: [] }]).success,
    false,
  );
  assert.equal(
    incomingSchema.safeParse([{ ...incoming[0], tuition: { amount: -1 } }])
      .success,
    false,
  );
  assert.equal(
    incomingSchema.safeParse([
      {
        ...incoming[0],
        deadlines: [
          { label: "Application", date: "2027-02-31", display: "Invalid" },
        ],
      },
    ]).success,
    false,
  );
  assert.equal(
    incomingSchema.safeParse([{ ...incoming[0], sourceRefs: [] }]).success,
    false,
  );
});
