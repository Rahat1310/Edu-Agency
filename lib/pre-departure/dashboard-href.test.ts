import assert from "node:assert/strict";
import { test } from "node:test";

import { preDepartureDashboardHref } from "@/lib/pre-departure/dashboard-href";

test("the dashboard hides pre-departure until the lead is on visa or later", () => {
  assert.equal(preDepartureDashboardHref("china", "offer"), null);
  assert.equal(preDepartureDashboardHref("china", "documents"), null);
  assert.equal(
    preDepartureDashboardHref("china", "visa"),
    "/destinations/china/pre-departure",
  );
  assert.equal(
    preDepartureDashboardHref("south_korea", "departed"),
    "/destinations/south-korea/pre-departure",
  );
});

test("an undecided file has no destination-specific pre-departure page", () => {
  assert.equal(preDepartureDashboardHref("undecided", "visa"), null);
});
