CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"type" text NOT NULL,
	"filename" text NOT NULL,
	"r2_key" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"review_note" text,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "documents_application_id_idx" ON "documents" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_r2_key_idx" ON "documents" USING btree ("r2_key");