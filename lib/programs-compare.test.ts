import assert from "node:assert/strict";
import { test } from "node:test";

import {
  COMPARE_PROGRAM_LIMIT,
  compareProgramsHref,
  parseCompareIds,
  serializeCompareIds,
  toggleCompareId,
} from "@/lib/programs-compare";

const a = "11111111-1111-4111-8111-111111111111";
const b = "22222222-2222-4222-8222-222222222222";
const c = "33333333-3333-4333-8333-333333333333";
const d = "44444444-4444-4444-8444-444444444444";

test("parseCompareIds keeps order, drops junk, and caps at 3", () => {
  assert.deepEqual(parseCompareIds(`${a},${b},${c}`), [a, b, c]);
  assert.deepEqual(parseCompareIds(`${a},not-a-uuid,${b}`), [a, b]);
  assert.deepEqual(parseCompareIds(`${a},${a},${b}`), [a, b]);
  assert.deepEqual(parseCompareIds(`${a},${b},${c},${d}`), [a, b, c]);
  assert.equal(
    parseCompareIds(`${a},${b},${c},${d}`).length,
    COMPARE_PROGRAM_LIMIT,
  );
});

test("serializeCompareIds round-trips a shareable ids query", () => {
  assert.equal(serializeCompareIds([a, b, c]), `${a},${b},${c}`);
  assert.equal(serializeCompareIds([a, "nope", b]), `${a},${b}`);
});

test("compareProgramsHref puts ids in a shareable query", () => {
  assert.equal(
    compareProgramsHref("en", [a, b]),
    `/programs/compare?ids=${a},${b}`,
  );
  assert.equal(compareProgramsHref("bn", [a]), `/bn/programs/compare?ids=${a}`);
});

test("toggleCompareId blocks a fourth selection without changing the list", () => {
  const full = toggleCompareId([a, b, c], d);
  assert.equal(full.blocked, true);
  assert.deepEqual(full.ids, [a, b, c]);

  const added = toggleCompareId([a, b], c);
  assert.equal(added.blocked, false);
  assert.deepEqual(added.ids, [a, b, c]);

  const removed = toggleCompareId([a, b, c], b);
  assert.equal(removed.blocked, false);
  assert.deepEqual(removed.ids, [a, c]);
});
