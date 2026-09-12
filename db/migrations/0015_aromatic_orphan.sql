CREATE TABLE "visa_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"destination" text NOT NULL,
	"sub_status" text DEFAULT 'preparing_documents' NOT NULL,
	"reference_number" text,
	"submitted_at" timestamp,
	"decided_at" timestamp,
	"notes" text
);
--> statement-breakpoint
-- One row per student; created when the lead moves to the existing visa stage.
ALTER TABLE "visa_applications" ADD CONSTRAINT "visa_applications_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "visa_applications_application_id_idx" ON "visa_applications" USING btree ("application_id");