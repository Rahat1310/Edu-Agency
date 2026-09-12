ALTER TABLE "messages" ALTER COLUMN "lead_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "external_sender_id" text;--> statement-breakpoint
CREATE INDEX "messages_unmatched_created_at_idx" ON "messages" USING btree ("created_at") WHERE "messages"."lead_id" is null;--> statement-breakpoint
CREATE INDEX "messages_external_sender_id_idx" ON "messages" USING btree ("external_sender_id") WHERE "messages"."external_sender_id" is not null;