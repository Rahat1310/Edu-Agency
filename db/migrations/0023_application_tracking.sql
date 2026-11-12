ALTER TABLE "applications" ADD COLUMN "tracking" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "tracking_version" integer DEFAULT 0 NOT NULL;