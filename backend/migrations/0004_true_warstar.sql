ALTER TABLE "opportunity_role_assignments" DROP CONSTRAINT "opportunity_role_assignments_opportunity_role_id_person_id_pk";--> statement-breakpoint
ALTER TABLE "opportunity_roles" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "opportunity_roles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ALTER COLUMN "opportunity_role_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "opportunity_roles" ADD COLUMN "job_grade" "job_grade";--> statement-breakpoint
ALTER TABLE "opportunity_roles" ADD COLUMN "level" "opportunity_level";--> statement-breakpoint
ALTER TABLE "opportunity_roles" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "opportunity_roles" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "opportunity_roles" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "opportunity_roles" DROP COLUMN "required_grade";--> statement-breakpoint
ALTER TABLE "opportunity_roles" DROP COLUMN "opportunity_level";--> statement-breakpoint
ALTER TABLE "opportunity_roles" DROP COLUMN "needs_hire";--> statement-breakpoint
ALTER TABLE "opportunity_roles" DROP COLUMN "comments";--> statement-breakpoint
ALTER TABLE "opportunity_roles" DROP COLUMN "new_hire_name";