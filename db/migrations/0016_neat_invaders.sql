ALTER TABLE "leads" ADD COLUMN "assigned_counselor_id" uuid;--> statement-breakpoint
-- Manual counselor assignment for performance stats (Section 5.3 / 5.8).
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_counselor_id_users_id_fk" FOREIGN KEY ("assigned_counselor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leads_assigned_counselor_id_idx" ON "leads" USING btree ("assigned_counselor_id");--> statement-breakpoint
-- Per-counselor date-bounded aggregates: assigned_counselor_id + created_at.
CREATE INDEX "leads_assigned_counselor_id_created_at_idx" ON "leads" USING btree ("assigned_counselor_id","created_at");--> statement-breakpoint
-- Visa success: decided sub_status rows in a date window.
CREATE INDEX "visa_applications_sub_status_decided_at_idx" ON "visa_applications" USING btree ("sub_status","decided_at");