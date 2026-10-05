CREATE TABLE "reports" (
	"report_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"place_id" uuid NOT NULL,
	"description" varchar(500) NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"admin_note" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_place_id_places_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("place_id") ON DELETE cascade ON UPDATE no action;