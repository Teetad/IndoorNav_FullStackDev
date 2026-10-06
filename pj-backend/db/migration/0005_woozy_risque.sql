CREATE TABLE "place_images" (
	"image_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"caption" varchar(200),
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "place_images" ADD CONSTRAINT "place_images_place_id_places_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("place_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "place_images_place_url_unique" ON "place_images" USING btree ("place_id","image_url");