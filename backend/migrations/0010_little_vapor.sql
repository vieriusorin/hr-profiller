CREATE TABLE "person_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"embedding_type" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"dimension" integer NOT NULL,
	"embedding" text NOT NULL,
	"searchable_text" text NOT NULL,
	"tokens_used" integer,
	"cost" varchar(20),
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "similarity_searches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_text" text NOT NULL,
	"query_embedding" text NOT NULL,
	"embedding_type" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"results" text NOT NULL,
	"limit" integer DEFAULT 10,
	"similarity_threshold" varchar(20),
	"execution_time" varchar(20),
	"tokens_used" integer,
	"cost" varchar(20),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "person_embeddings" ADD CONSTRAINT "person_embeddings_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;