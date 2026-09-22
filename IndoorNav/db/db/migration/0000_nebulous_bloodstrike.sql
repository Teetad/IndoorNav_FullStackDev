CREATE TABLE "buildings" (
	"building_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_name" varchar(120) NOT NULL,
	"description" varchar(500),
	CONSTRAINT "buildings_building_name_unique" UNIQUE("building_name")
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"floor_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"floor_number" integer NOT NULL,
	"floor_plan_image" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "places" (
	"place_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"floor_id" uuid NOT NULL,
	"place_name" varchar(120) NOT NULL,
	"room_number" varchar(30),
	"description" varchar(500),
	"image_url" varchar(500),
	"fav_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_buildings_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("building_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_floor_id_floors_floor_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("floor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "floors_building_floor_number_unique" ON "floors" USING btree ("building_id","floor_number");