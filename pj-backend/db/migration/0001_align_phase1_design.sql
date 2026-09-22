ALTER TABLE "buildings" DROP CONSTRAINT "buildings_building_code_unique";--> statement-breakpoint
ALTER TABLE "floors" ADD COLUMN "floor_plan_image" varchar(500);--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "image_url" varchar(500);--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "fav_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "buildings" DROP COLUMN "building_code";--> statement-breakpoint
ALTER TABLE "buildings" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "buildings" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "floors" DROP COLUMN "floor_name";--> statement-breakpoint
ALTER TABLE "floors" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "floors" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "places" DROP COLUMN "place_type";--> statement-breakpoint
ALTER TABLE "places" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "places" DROP COLUMN "updated_at";