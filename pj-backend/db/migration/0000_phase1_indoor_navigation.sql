CREATE TABLE "buildings" (
	"building_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_name" varchar(120) NOT NULL,
	"building_code" varchar(20),
	"description" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "buildings_building_name_unique" UNIQUE("building_name"),
	CONSTRAINT "buildings_building_code_unique" UNIQUE("building_code")
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"floor_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"floor_number" integer NOT NULL,
	"floor_name" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"place_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"floor_id" uuid NOT NULL,
	"place_name" varchar(120) NOT NULL,
	"place_type" varchar(50),
	"description" varchar(500),
	"room_number" varchar(30),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_buildings_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("building_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_floor_id_floors_floor_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("floor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "floors_building_floor_number_unique" ON "floors" USING btree ("building_id","floor_number");