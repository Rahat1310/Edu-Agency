import assert from "node:assert/strict";
import { test } from "node:test";
import { PgDialect } from "drizzle-orm/pg-core";
import { applicationTrackingUpdateQuery } from "@/lib/applications/queries";
import {
  applyTrackingUpdate,
  readApplicationTracking,
  trackingUpdateSchema,
} from "@/lib/applications/tracking";

const now = "2026-11-12T10:00:00.000Z";
const submitted = readApplicationTracking({}, now);
const id = "12345678-1234-4234-8234-123456789012";

test("submission comes from the saved form, not an editable tracker entry", () => {
  assert.deepEqual(readApplicationTracking(submitted, null), {});
  assert.equal(
    readApplicationTracking(
      { submitted: { status: "blocked", note: "Wrong", updatedAt: now } },
      now,
    ).submitted?.status,
    "completed",
  );
  assert.equal(
    trackingUpdateSchema.safeParse({
      id,
      version: 0,
      step: "submitted",
      status: "completed",
      note: "",
    }).success,
    false,
  );
});

test("a blocked milestone requires a nonblank student-visible reason", () => {
  for (const note of ["", "   "]) {
    assert.equal(
      trackingUpdateSchema.safeParse({
        id,
        version: 0,
        step: "received",
        status: "blocked",
        note,
      }).success,
      false,
    );
    assert.equal(
      applyTrackingUpdate(
        submitted,
        { step: "received", status: "blocked", note },
        now,
      ).ok,
      false,
    );
  }
  const blocked = applyTrackingUpdate(
    submitted,
    {
      step: "received",
      status: "blocked",
      note: "Please upload a clear passport scan.",
    },
    now,
  );
  assert.ok(blocked.ok);
  assert.equal(
    blocked.tracking.received?.note,
    "Please upload a clear passport scan.",
  );
  const resolved = applyTrackingUpdate(
    blocked.tracking,
    { step: "received", status: "completed", note: "Clear copy received." },
    now,
  );
  assert.ok(resolved.ok);
  assert.equal(resolved.tracking.received?.status, "completed");
  assert.equal(resolved.tracking.received?.note, "Clear copy received.");
});

test("milestones cannot skip an earlier incomplete or blocked step", () => {
  assert.equal(
    applyTrackingUpdate(
      submitted,
      { step: "documents", status: "completed", note: "" },
      now,
    ).ok,
    false,
  );
  const received = applyTrackingUpdate(
    submitted,
    { step: "received", status: "completed", note: "" },
    now,
  );
  assert.ok(received.ok);
  const processing = applyTrackingUpdate(
    received.tracking,
    { step: "processing", status: "in_progress", note: "Review started." },
    now,
  );
  assert.ok(processing.ok);
  assert.equal(
    applyTrackingUpdate(
      processing.tracking,
      { step: "received", status: "pending", note: "" },
      now,
    ).ok,
    false,
  );
  assert.equal(
    applyTrackingUpdate(
      processing.tracking,
      { step: "documents", status: "in_progress", note: "" },
      now,
    ).ok,
    false,
  );
});

test("tracker writes atomically guard version and submission and record a public audit", () => {
  const compiled = new PgDialect().sqlToQuery(
    applicationTrackingUpdateQuery({
      id,
      version: 3,
      tracking: submitted,
      actorId: id,
      message: "Received by team: Completed",
    }),
  );
  assert.match(compiled.sql, /tracking_version=tracking_version\+1/);
  assert.match(
    compiled.sql,
    /tracking_version=\$\d+ AND submitted_at IS NOT NULL/,
  );
  assert.match(compiled.sql, /INSERT INTO lead_activity/);
  assert.match(compiled.sql, /FROM changed/);
  assert.ok(compiled.params.includes(3));
  assert.ok(compiled.params.includes("Received by team: Completed"));
});

test("a counsellor can flag a problem on any milestone without erasing other progress", () => {
  const received = applyTrackingUpdate(
    submitted,
    { step: "received", status: "completed", note: "" },
    now,
  );
  assert.ok(received.ok);
  const processing = applyTrackingUpdate(
    received.tracking,
    { step: "processing", status: "in_progress", note: "Review started." },
    now,
  );
  assert.ok(processing.ok);
  const flagged = applyTrackingUpdate(
    processing.tracking,
    {
      step: "received",
      status: "blocked",
      note: "We need to confirm your contact details.",
    },
    now,
  );
  assert.ok(flagged.ok);
  assert.equal(flagged.tracking.processing?.status, "in_progress");
  const resolved = applyTrackingUpdate(
    flagged.tracking,
    { step: "received", status: "completed", note: "Details confirmed." },
    now,
  );
  assert.ok(resolved.ok);
  assert.equal(resolved.tracking.processing?.status, "in_progress");
  assert.ok(
    applyTrackingUpdate(
      submitted,
      {
        step: "documents",
        status: "blocked",
        note: "Your passport copy is missing.",
      },
      now,
    ).ok,
  );
});
