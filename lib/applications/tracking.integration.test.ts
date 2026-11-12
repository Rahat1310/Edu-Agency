import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { neon } from "@neondatabase/serverless";
import { PgDialect } from "drizzle-orm/pg-core";
import { applicationTrackingUpdateQuery } from "@/lib/applications/queries";
import {
  readApplicationTracking,
  type ApplicationTracking,
} from "@/lib/applications/tracking";

test(
  "published tracker updates persist, reject stale writes and retain student-visible reasons",
  { skip: !process.env.DATABASE_URL },
  async () => {
    const client = neon(process.env.DATABASE_URL!);
    const dialect = new PgDialect();
    const userId = randomUUID(),
      leadId = randomUUID(),
      id = randomUUID();
    const now = new Date().toISOString();
    const base = readApplicationTracking({}, now);
    const blocked: ApplicationTracking = {
      ...base,
      received: {
        status: "blocked",
        note: "Please upload a clear passport scan.",
        updatedAt: now,
      },
    };
    const resolved: ApplicationTracking = {
      ...base,
      received: {
        status: "completed",
        note: "Clear copy received.",
        updatedAt: now,
      },
    };
    const write = (
      version: number,
      tracking: ApplicationTracking,
      message: string,
    ) => {
      const query = dialect.sqlToQuery(
        applicationTrackingUpdateQuery({
          id,
          version,
          tracking,
          actorId: userId,
          message,
        }),
      );
      return client.query(query.sql, query.params);
    };
    // Disposable fixtures, writes and cleanup share one transaction; failures roll it all back.
    const rows = await client.transaction([
      client`INSERT INTO users (id, clerk_id, email) VALUES (${userId}::uuid, ${`tracker-test-${userId}`}, 'tracker-fixture@example.invalid')`,
      client`INSERT INTO leads (id, name, phone, destination_interest, source) VALUES (${leadId}::uuid, 'Tracker fixture', '+8801700000000', 'china', 'integration-test')`,
      client`INSERT INTO applications (id, lead_id, user_id) VALUES (${id}::uuid, ${leadId}::uuid, ${userId}::uuid)`,
      write(
        0,
        blocked,
        "Needs attention: Please upload a clear passport scan.",
      ),
      client`UPDATE applications SET submitted_at=now(), form_status='submitted' WHERE id=${id}::uuid`,
      write(
        0,
        blocked,
        "Needs attention: Please upload a clear passport scan.",
      ),
      write(0, resolved, "Stale update must not appear"),
      client`SELECT tracking, tracking_version FROM applications WHERE id=${id}::uuid`,
      write(1, resolved, "Resolved: Clear copy received."),
      client`SELECT tracking, tracking_version FROM applications WHERE id=${id}::uuid`,
      client`SELECT content, is_visible_to_student FROM lead_activity WHERE lead_id=${leadId}::uuid ORDER BY content`,
      client`DELETE FROM lead_activity WHERE lead_id=${leadId}::uuid`,
      client`DELETE FROM applications WHERE id=${id}::uuid`,
      client`DELETE FROM leads WHERE id=${leadId}::uuid`,
      client`DELETE FROM users WHERE id=${userId}::uuid`,
    ]);
    assert.equal(
      rows[3]?.length,
      0,
      "draft cannot have staff milestones published",
    );
    assert.equal(rows[5]?.length, 1);
    assert.equal(rows[6]?.length, 0, "stale update rejected");
    assert.equal(rows[7]?.[0]?.tracking_version, 1);
    assert.equal(rows[7]?.[0]?.tracking.received.status, "blocked");
    assert.equal(rows[7]?.[0]?.tracking.received.note, blocked.received?.note);
    assert.equal(rows[8]?.length, 1);
    assert.equal(rows[9]?.[0]?.tracking_version, 2);
    assert.equal(rows[9]?.[0]?.tracking.received.status, "completed");
    assert.equal(rows[10]?.length, 2, "only successful writes create activity");
    assert.ok(rows[10]?.every((row) => row.is_visible_to_student));
  },
);
