ALTER TABLE "places" ADD COLUMN "room_status" varchar(20) DEFAULT 'UNKNOWN' NOT NULL;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "opening_time" varchar(5);--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "closing_time" varchar(5);