ALTER TABLE "applications" ADD COLUMN "application_data" jsonb;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "form_status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "form_updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "requested_documents" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "review_message" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "university_review" text DEFAULT 'reviewing' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "proposed_university" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "university_note" text;