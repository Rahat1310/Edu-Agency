CREATE TABLE "visa_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination" text NOT NULL,
	"document_name" text NOT NULL,
	"document_type_key" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "visa_requirements_destination_is_published_idx" ON "visa_requirements" USING btree ("destination","is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "visa_requirements_destination_type_key_idx" ON "visa_requirements" USING btree ("destination","document_type_key");
--> statement-breakpoint
-- documents.type must stay plain text so destination-specific keys (Section 5.4)
-- do not need a Postgres enum migration. Existing values are preserved.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documents'
      AND column_name = 'type'
      AND data_type <> 'text'
  ) THEN
    ALTER TABLE "documents"
      ALTER COLUMN "type" TYPE text
      USING "type"::text;
  END IF;
END $$;
--> statement-breakpoint
-- Placeholder checklist rows until destination research. The student-facing
-- loader in 7.2 only returns is_published = true.
INSERT INTO "visa_requirements" (
  "destination",
  "document_name",
  "document_type_key",
  "description",
  "sort_order",
  "notes",
  "is_published"
) VALUES
  (
    'china',
    'Placeholder — JW201/JW202 form',
    'jw201_jw202',
    'Placeholder — China X1/X2 visa pack. Replace after destination research.',
    0,
    'Placeholder until destination research.',
    true
  ),
  (
    'china',
    'Placeholder — Admission Letter',
    'admission_letter',
    'Placeholder — university admission letter for the JW201/JW202 file.',
    1,
    'Placeholder until destination research.',
    true
  ),
  (
    'china',
    'Placeholder — X1/X2 visa',
    'x1_x2_visa',
    'Placeholder — stay type depends on the program length.',
    2,
    'Placeholder until destination research.',
    true
  ),
  (
    'china',
    'Placeholder — Passport copy',
    'passport_copy',
    'Placeholder — bio page scan for the visa file.',
    3,
    'Placeholder until destination research.',
    true
  ),
  (
    'india',
    'Placeholder — SII portal registration',
    'sii_registration',
    'Placeholder — Study in India registration comes before the e-Student visa.',
    0,
    'Placeholder until destination research.',
    true
  ),
  (
    'india',
    'Placeholder — SII-ID',
    'sii_id',
    'Placeholder — SII-ID generated after portal registration.',
    1,
    'Placeholder until destination research.',
    true
  ),
  (
    'india',
    'Placeholder — Admission Letter',
    'admission_letter',
    'Placeholder — university offer used with the SII-ID.',
    2,
    'Placeholder until destination research.',
    true
  ),
  (
    'india',
    'Placeholder — Passport copy',
    'passport_copy',
    'Placeholder — bio page scan for the e-Student visa.',
    3,
    'Placeholder until destination research.',
    true
  ),
  (
    'malaysia',
    'Placeholder — EMGS Approval to Study',
    'emgs_approval',
    'Placeholder — EMGS approval letter before the Single Entry Visa.',
    0,
    'Placeholder until destination research.',
    true
  ),
  (
    'malaysia',
    'Placeholder — Single Entry Visa (eVISA)',
    'evisa',
    'Placeholder — applicant must be outside Malaysia when applying.',
    1,
    'Placeholder until destination research.',
    true
  ),
  (
    'malaysia',
    'Placeholder — EMGS medical',
    'emgs_medical',
    'Placeholder — medical screening tied to the Student Pass file.',
    2,
    'Placeholder until destination research.',
    true
  ),
  (
    'malaysia',
    'Placeholder — Passport copy',
    'passport_copy',
    'Placeholder — bio page scan for EMGS.',
    3,
    'Placeholder until destination research.',
    true
  ),
  (
    'south_korea',
    'Placeholder — D-2 / D-4 stay',
    'd2_d4',
    'Placeholder — D-2 for degree programmes, D-4 for language/non-degree.',
    0,
    'Placeholder until destination research.',
    true
  ),
  (
    'south_korea',
    'Placeholder — Admission Letter',
    'admission_letter',
    'Placeholder — university or language-institute admission letter.',
    1,
    'Placeholder until destination research.',
    true
  ),
  (
    'south_korea',
    'Placeholder — Passport copy',
    'passport_copy',
    'Placeholder — bio page scan for the D-2/D-4 file.',
    2,
    'Placeholder until destination research.',
    true
  ),
  (
    'south_korea',
    'Placeholder — Bank certificate',
    'bank_certificate',
    'Placeholder — proof of funds; replace with the researched amount.',
    3,
    'Placeholder until destination research.',
    true
  );