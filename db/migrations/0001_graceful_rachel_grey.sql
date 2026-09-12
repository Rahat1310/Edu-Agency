CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university_name" text NOT NULL,
	"country" text NOT NULL,
	"level" text NOT NULL,
	"field" text NOT NULL,
	"tuition_amount" numeric(12, 2) NOT NULL,
	"tuition_currency" text NOT NULL,
	"intake_months" text[],
	"requirements" text,
	"scholarship_info" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "programs_country_idx" ON "programs" USING btree ("country");--> statement-breakpoint
CREATE INDEX "programs_level_idx" ON "programs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "programs_is_published_idx" ON "programs" USING btree ("is_published");