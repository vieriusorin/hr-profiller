ALTER TABLE "employment_details" ALTER COLUMN "job_grade" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "opportunity_roles" ALTER COLUMN "job_grade" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."job_grade";--> statement-breakpoint
CREATE TYPE "public"."job_grade" AS ENUM('JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM');--> statement-breakpoint
ALTER TABLE "employment_details" ALTER COLUMN "job_grade" SET DATA TYPE "public"."job_grade" USING "job_grade"::"public"."job_grade";--> statement-breakpoint
ALTER TABLE "opportunity_roles" ALTER COLUMN "job_grade" SET DATA TYPE "public"."job_grade" USING "job_grade"::"public"."job_grade";--> statement-breakpoint
ALTER TABLE "employment_details" ALTER COLUMN "hire_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "employment_details" ALTER COLUMN "termination_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "opportunities" ALTER COLUMN "expected_start_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "opportunities" ALTER COLUMN "expected_end_date" SET DATA TYPE timestamp;