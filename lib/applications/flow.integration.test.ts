import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { neon } from "@neondatabase/serverless";
import { PgDialect } from "drizzle-orm/pg-core";
import {
  studentApplicationSaveQuery,
  applicationReviewQuery,
} from "@/lib/applications/queries";
import { applicationDocumentChecklist } from "@/lib/applications/documents";
import {
  emptyApplicationData,
  emptyEducation,
} from "@/lib/applications/schema";

test(
  "application save, submission, review, resubmission and ownership guards are atomic",
  { skip: !process.env.DATABASE_URL },
  async () => {
    const client = neon(process.env.DATABASE_URL!);
    const dialect = new PgDialect();
    const userId = randomUUID(),
      leadId = randomUUID(),
      applicationId = randomUUID();
    const data = {
      ...emptyApplicationData(),
      fullName: "Application integration fixture",
      dateOfBirth: "2000-01-01",
      passportNumber: "TESTONLY",
      passportExpiry: "2099-01-01",
      phone: "+8801700000000",
      address: "Test fixture",
      country: "china" as const,
      preferredUniversity: "Original preference",
      course: "Sample course",
      intake: "September 2027",
      education: [
        {
          ...emptyEducation("hsc"),
          institution: "Fixture",
          subject: "Science",
          passingYear: "2025",
          result: "5",
          gradingScale: "5",
        },
      ],
      consent: true,
    };
    const query = (
      statement: ReturnType<typeof studentApplicationSaveQuery>,
    ) => {
      const compiled = dialect.sqlToQuery(statement);
      return client.query(compiled.sql, compiled.params);
    };
    const save = (
      revision: number,
      mode: "draft" | "submit",
      overrides: Partial<
        Parameters<typeof studentApplicationSaveQuery>[0]
      > = {},
    ) =>
      query(
        studentApplicationSaveQuery({
          applicationId,
          userId,
          revision,
          mode,
          data,
          requestedDocuments: [],
          ...overrides,
        }),
      );
    const review = (revision: number, requestedDocuments: string[] = []) =>
      query(
        applicationReviewQuery(
          {
            id: applicationId,
            revision,
            requestChanges: true,
            reviewMessage: "Please review the form",
            universityReview: "unavailable",
            proposedUniversity: "",
            universityNote:
              "Original preference is unavailable; we will contact you.",
            requestedDocuments,
            contactNote: "PRIVATE_CONTACT_RECORD",
          },
          userId,
        ),
      );
    const types = applicationDocumentChecklist(data)
      .filter((s) => s.required)
      .map((s) => s.documentTypeKey);
    // All fixtures are created and removed within ONE transaction. Failure rolls back the transaction.
    // No R2 objects, notifications or existing student records are touched.
    const result = await client.transaction([
      client`INSERT INTO users (id, clerk_id, email, full_name) VALUES (${userId}::uuid, ${`application-test-${userId}`}, 'fixture@example.invalid', 'Integration fixture') RETURNING id`,
      client`INSERT INTO leads (id, name, phone, destination_interest, source) VALUES (${leadId}::uuid, 'Original enquiry name', '+8801700000000', 'china', 'integration-test') RETURNING id`,
      client`INSERT INTO applications (id, lead_id, user_id) VALUES (${applicationId}::uuid, ${leadId}::uuid, ${userId}::uuid) RETURNING id`,
      save(0, "draft"),
      save(1, "draft", { userId: randomUUID() }),
      save(0, "draft"),
      save(1, "submit"),
      client`INSERT INTO documents (application_id, type, filename, r2_key) SELECT ${applicationId}::uuid, value, 'fixture.pdf', ${`test-only/${applicationId}/`} || value FROM jsonb_array_elements_text(${JSON.stringify(types)}::jsonb) RETURNING id`,
      save(1, "submit"),
      save(2, "draft"),
      review(2, ["medical"]),
      save(3, "submit", { requestedDocuments: ["medical"] }),
      client`INSERT INTO documents (application_id, type, filename, r2_key) VALUES (${applicationId}::uuid, 'medical', 'fixture.pdf', ${`test-only/${applicationId}/medical`}) RETURNING id`,
      save(3, "submit", {
        data: { ...data, fullName: "Corrected fixture name" },
        requestedDocuments: ["medical"],
      }),
      client`SELECT count(*)::int AS total, count(*) FILTER (WHERE is_visible_to_student AND content LIKE '%PRIVATE_CONTACT_RECORD%')::int AS leaked FROM lead_activity WHERE lead_id=${leadId}::uuid`,
      client`SELECT count(*)::int AS total, (array_agg(data->>'fullName' ORDER BY revision))[1] AS original_name FROM application_submissions WHERE application_id=${applicationId}::uuid`,
      client`SELECT name, source, status FROM leads WHERE id=${leadId}::uuid`,
      client`UPDATE leads SET status='applied' WHERE id=${leadId}::uuid RETURNING id`,
      review(4, ["medical"]),
      save(5, "draft", { data: { ...data, country: "india" } }),
      client`DELETE FROM documents WHERE application_id=${applicationId}::uuid`,
      client`DELETE FROM lead_activity WHERE lead_id=${leadId}::uuid`,
      client`DELETE FROM applications WHERE id=${applicationId}::uuid`,
      client`DELETE FROM leads WHERE id=${leadId}::uuid`,
      client`DELETE FROM users WHERE id=${userId}::uuid`,
      client`SELECT count(*)::int AS remaining FROM application_submissions WHERE application_id=${applicationId}::uuid`,
    ]);
    assert.equal(result[3]?.[0]?.revision, 1, "draft saved");
    for (const index of [4, 5, 6, 9, 11, 19])
      assert.equal(
        result[index]?.length,
        0,
        `guard ${index} blocked the write`,
      );
    assert.equal(result[8]?.[0]?.revision, 2, "complete application submitted");
    assert.equal(result[10]?.length, 1, "staff review reopened the form");
    assert.equal(
      result[13]?.[0]?.revision,
      4,
      "corrected application resubmitted",
    );
    assert.equal(
      result[14]?.[0]?.leaked,
      0,
      "staff contact notes stayed private",
    );
    assert.equal(result[15]?.[0]?.total, 2, "both submitted copies retained");
    assert.equal(
      result[15]?.[0]?.original_name,
      data.fullName,
      "first submission is immutable",
    );
    assert.equal(result[16]?.[0]?.name, "Corrected fixture name");
    assert.equal(
      result[16]?.[0]?.source,
      "integration-test",
      "original lead source preserved",
    );
    assert.equal(
      result[16]?.[0]?.status,
      "new",
      "student submission cannot mark a university application Applied",
    );
    assert.equal(
      result[25]?.[0]?.remaining,
      0,
      "fixture cleanup included submission history",
    );
  },
);
