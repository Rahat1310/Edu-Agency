CREATE TABLE "success_stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_name" text NOT NULL,
	"destination" text NOT NULL,
	"university" text NOT NULL,
	"program" text NOT NULL,
	"photo_r2_key" text,
	"quote" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "success_stories_is_published_idx" ON "success_stories" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "success_stories_destination_idx" ON "success_stories" USING btree ("destination");
--> statement-breakpoint
-- Placeholder stories until the founder replaces them. The unpublished row
-- must not appear on /success-stories. Photos are omitted (public R2 base URL).
INSERT INTO "success_stories" ("student_name", "destination", "university", "program", "quote", "is_published") VALUES
	('Ayesha R.', 'china', 'Tsinghua University', 'Computer Science', 'Placeholder — the counselor mapped the JW202 sequence before we paid anyone.', true),
	('Tanvir H.', 'china', 'Zhejiang University', 'MBBS', 'Placeholder — China felt less like a brochure and more like a file we could actually finish.', true),
	('Rahim K.', 'india', 'University of Delhi', 'Commerce', 'Placeholder — SII-ID came first. That order is what we had been missing.', true),
	('Nabila S.', 'malaysia', 'Taylor''s University', 'Business', 'Placeholder — EMGS was a sequence, not a surprise, once someone laid it out in Bangla.', true),
	('Farhan A.', 'south_korea', 'Korea University', 'Engineering', 'Placeholder — D-2 versus D-4 was the question. We did not apply for the wrong stay.', true),
	('Draft student', 'china', 'Draft University', 'Draft program', 'Unpublished draft — must stay off the public listing.', false);