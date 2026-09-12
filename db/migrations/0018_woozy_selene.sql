CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"direction" text NOT NULL,
	"channel" text NOT NULL,
	"body" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nurture_sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"step_id" text NOT NULL,
	"channel" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nurture_sends" ADD CONSTRAINT "nurture_sends_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_lead_id_idx" ON "messages" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "messages_lead_id_created_at_idx" ON "messages" USING btree ("lead_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_lead_id_direction_created_at_idx" ON "messages" USING btree ("lead_id","direction","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "nurture_sends_lead_id_step_id_idx" ON "nurture_sends" USING btree ("lead_id","step_id");--> statement-breakpoint
CREATE INDEX "nurture_sends_lead_id_idx" ON "nurture_sends" USING btree ("lead_id");