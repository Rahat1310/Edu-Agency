CREATE TABLE "lead_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"actor_user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"content" text,
	"from_status" text,
	"to_status" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "lead_activity" ADD CONSTRAINT "lead_activity_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activity" ADD CONSTRAINT "lead_activity_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lead_activity_lead_id_idx" ON "lead_activity" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_activity_actor_user_id_idx" ON "lead_activity" USING btree ("actor_user_id");