CREATE TABLE "assessment_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"provider_id" text,
	"error" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counselor_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"title" text NOT NULL,
	"phone" text NOT NULL,
	"whatsapp" text NOT NULL,
	"email" text,
	"active" boolean DEFAULT false NOT NULL,
	"auto_assign" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "assessment" jsonb;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "submission_key" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "submission_hash" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "assessment_status" text DEFAULT 'NEW' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "consent_version" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "follow_up_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "assessment_outbox" ADD CONSTRAINT "assessment_outbox_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "counselor_profiles" ADD CONSTRAINT "counselor_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_outbox_lead_channel" ON "assessment_outbox" USING btree ("lead_id","channel");--> statement-breakpoint
CREATE UNIQUE INDEX "one_auto_assign_counselor" ON "counselor_profiles" USING btree ("auto_assign") WHERE "counselor_profiles"."auto_assign" = true;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_reference_unique" UNIQUE("reference");--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_submission_key_unique" UNIQUE("submission_key");
--> statement-breakpoint
CREATE SEQUENCE assessment_reference_seq;
--> statement-breakpoint
ALTER TABLE leads ADD CONSTRAINT assessment_status_check CHECK (assessment_status IN ('NEW','CONTACTED','UNDER_ASSESSMENT','OPTIONS_SHARED','FILE_OPENED','CLOSED'));
--> statement-breakpoint
CREATE INDEX assessment_outbox_due_idx ON assessment_outbox(status, next_attempt_at);
--> statement-breakpoint
CREATE FUNCTION enqueue_assessment_notifications() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.assessment IS NOT NULL THEN
    INSERT INTO assessment_outbox(lead_id, channel) VALUES (NEW.id, 'email'), (NEW.id, 'whatsapp');
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER assessment_notifications AFTER INSERT ON leads FOR EACH ROW EXECUTE FUNCTION enqueue_assessment_notifications();
--> statement-breakpoint
-- Private server-only tables. No anonymous/public Supabase-style API policies.
ALTER TABLE counselor_profiles ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE assessment_outbox ENABLE ROW LEVEL SECURITY;
