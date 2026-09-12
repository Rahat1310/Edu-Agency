CREATE TABLE "cost_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination" text NOT NULL,
	"category" text NOT NULL,
	"monthly_amount" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cost_estimates_destination_category_idx" ON "cost_estimates" USING btree ("destination","category");--> statement-breakpoint
CREATE INDEX "cost_estimates_destination_idx" ON "cost_estimates" USING btree ("destination");--> statement-breakpoint
-- Placeholder bands until destination research. Tuition rows are yearly;
-- living rows are monthly. Founder edits these in Studio without a code change.
INSERT INTO "cost_estimates" ("destination", "category", "monthly_amount", "currency") VALUES
	('china', 'tuition', '22000.00', 'CNY'),
	('china', 'accommodation', '1800.00', 'CNY'),
	('china', 'food', '1500.00', 'CNY'),
	('china', 'transport', '250.00', 'CNY'),
	('china', 'misc', '500.00', 'CNY'),
	('india', 'tuition', '180000.00', 'INR'),
	('india', 'accommodation', '10000.00', 'INR'),
	('india', 'food', '8000.00', 'INR'),
	('india', 'transport', '1500.00', 'INR'),
	('india', 'misc', '3500.00', 'INR'),
	('malaysia', 'tuition', '22000.00', 'MYR'),
	('malaysia', 'accommodation', '700.00', 'MYR'),
	('malaysia', 'food', '600.00', 'MYR'),
	('malaysia', 'transport', '120.00', 'MYR'),
	('malaysia', 'misc', '280.00', 'MYR'),
	('south_korea', 'tuition', '7500000.00', 'KRW'),
	('south_korea', 'accommodation', '450000.00', 'KRW'),
	('south_korea', 'food', '400000.00', 'KRW'),
	('south_korea', 'transport', '70000.00', 'KRW'),
	('south_korea', 'misc', '180000.00', 'KRW');