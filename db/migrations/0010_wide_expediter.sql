CREATE TABLE "intake_deadlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination" text NOT NULL,
	"intake_label" text NOT NULL,
	"application_deadline" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "intake_deadlines_destination_label_idx" ON "intake_deadlines" USING btree ("destination","intake_label");--> statement-breakpoint
CREATE INDEX "intake_deadlines_destination_deadline_idx" ON "intake_deadlines" USING btree ("destination","application_deadline");
--> statement-breakpoint
-- Placeholder dates until destination research. Past rows stay in the
-- table so the public countdown can skip them and show the next intake.
INSERT INTO "intake_deadlines" ("destination", "intake_label", "application_deadline") VALUES
	('china', 'Fall 2026', '2026-05-01'),
	('china', 'Spring 2027', '2026-12-15'),
	('china', 'Fall 2027', '2027-05-15'),
	('india', 'Fall 2026', '2026-06-01'),
	('india', 'Spring 2027', '2026-11-30'),
	('india', 'Fall 2027', '2027-06-01'),
	('malaysia', 'September 2026', '2026-04-30'),
	('malaysia', 'February 2027', '2026-10-31'),
	('malaysia', 'September 2027', '2027-04-30'),
	('south_korea', 'September 2026', '2026-05-20'),
	('south_korea', 'March 2027', '2026-11-15'),
	('south_korea', 'September 2027', '2027-05-20');