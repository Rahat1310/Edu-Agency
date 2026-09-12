CREATE TABLE "reminders_sent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"deadline_id" uuid NOT NULL,
	"window" integer NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reminders_sent" ADD CONSTRAINT "reminders_sent_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders_sent" ADD CONSTRAINT "reminders_sent_deadline_id_intake_deadlines_id_fk" FOREIGN KEY ("deadline_id") REFERENCES "public"."intake_deadlines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reminders_sent_application_deadline_window_idx" ON "reminders_sent" USING btree ("application_id","deadline_id","window");--> statement-breakpoint
CREATE INDEX "reminders_sent_application_id_idx" ON "reminders_sent" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "reminders_sent_deadline_id_idx" ON "reminders_sent" USING btree ("deadline_id");