CREATE TYPE "public"."employee_status" AS ENUM('Active', 'On Leave', 'Inactive');--> statement-breakpoint
CREATE TYPE "public"."work_status" AS ENUM('On Project', 'On Bench', 'Available');--> statement-breakpoint
CREATE TABLE "employee_unavailable_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "employee_status" "employee_status" DEFAULT 'Active' NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "work_status" "work_status" DEFAULT 'Available' NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "job_grade" "job_grade";--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "location" varchar(100);--> statement-breakpoint
ALTER TABLE "employee_unavailable_dates" ADD CONSTRAINT "employee_unavailable_dates_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;