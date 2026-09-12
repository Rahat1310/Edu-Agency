import assert from "node:assert/strict";
import { test } from "node:test";

import { programCountryFromLeadDestination } from "@/lib/visa-requirements/destination";

test("undecided is not a visa-requirement destination", () => {
  assert.equal(programCountryFromLeadDestination("undecided"), null);
});

test("locked countries map onto program countries for the checklist loader", () => {
  assert.equal(programCountryFromLeadDestination("china"), "china");
  assert.equal(programCountryFromLeadDestination("south_korea"), "south_korea");
});
