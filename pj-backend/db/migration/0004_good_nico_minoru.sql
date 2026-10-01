CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"oauth_subject" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"display_name" varchar(120),
	"role" varchar(20) DEFAULT 'USER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_oauth_subject_unique" UNIQUE("oauth_subject"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
