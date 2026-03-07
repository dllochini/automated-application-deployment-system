CREATE TABLE "ports" (
	"port_number" integer PRIMARY KEY NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"repo_url" varchar(1024) NOT NULL,
	"framework" varchar(64) NOT NULL,
	"port" integer NOT NULL,
	"status" varchar(32) NOT NULL,
	"container_id" varchar(256),
	"created_at" timestamp DEFAULT now()
);
