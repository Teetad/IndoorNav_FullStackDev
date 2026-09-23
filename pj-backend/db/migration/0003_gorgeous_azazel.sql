CREATE TABLE "place_keywords" (
	"keyword_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"keyword" varchar(100) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "place_keywords" ADD CONSTRAINT "place_keywords_place_id_places_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("place_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "place_keywords_place_keyword_unique" ON "place_keywords" USING btree ("place_id","keyword");