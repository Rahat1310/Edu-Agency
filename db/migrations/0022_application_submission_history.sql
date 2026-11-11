CREATE TABLE "application_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"data" jsonb NOT NULL,
	"document_ids" jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "application_submissions" ADD CONSTRAINT "application_submissions_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_submissions_revision_idx" ON "application_submissions" USING btree ("application_id","revision");