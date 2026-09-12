DROP INDEX "leads_status_idx";--> statement-breakpoint
DROP INDEX "leads_destination_interest_idx";--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_status_created_at_idx" ON "leads" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "leads_destination_interest_created_at_idx" ON "leads" USING btree ("destination_interest","created_at");