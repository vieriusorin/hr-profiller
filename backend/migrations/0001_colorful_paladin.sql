CREATE TYPE "public"."opportunity_status" AS ENUM('In Progress', 'On Hold', 'Done');--> statement-breakpoint
CREATE TYPE "public"."job_grade" AS ENUM('T', 'C', 'SC', 'ST', 'SE', 'IC3', 'IC4', 'IC5', 'M2');--> statement-breakpoint
CREATE TYPE "public"."opportunity_level" AS ENUM('Low', 'Medium', 'High');--> statement-breakpoint
CREATE TYPE "public"."role_status" AS ENUM('Open', 'Staffed', 'Won', 'Lost');--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_name" varchar(255) NOT NULL,
	"client_id" integer,
	"client_name" varchar(255),
	"expected_start_date" date,
	"expected_end_date" date,
	"probability" integer,
	"status" "opportunity_status" DEFAULT 'In Progress' NOT NULL,
	"comment" text,
	"is_active" boolean DEFAULT false,
	"activated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunity_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" integer NOT NULL,
	"role_name" varchar(255) NOT NULL,
	"required_grade" "job_grade" NOT NULL,
	"opportunity_level" "opportunity_level" NOT NULL,
	"needs_hire" boolean DEFAULT false,
	"allocation" integer,
	"comments" text,
	"status" "role_status" DEFAULT 'Open' NOT NULL,
	"new_hire_name" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunity_role_assignments" (
	"opportunity_role_id" uuid NOT NULL,
	"employee_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "opportunity_role_assignments_opportunity_role_id_employee_id_pk" PRIMARY KEY("opportunity_role_id","employee_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"department_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicant_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"in_progress" boolean DEFAULT false,
	"notes" text,
	"applied_at" timestamp DEFAULT now(),
	"screening_at" timestamp,
	"interview_at" timestamp,
	"offer_at" timestamp,
	"rejected_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "applicants" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"status" "application_status" DEFAULT 'applied',
	"resume_url" varchar(2048),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "applicants_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "application_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" date NOT NULL,
	"applied_count" integer DEFAULT 0,
	"screening_count" integer DEFAULT 0,
	"interview_count" integer DEFAULT 0,
	"offer_count" integer DEFAULT 0,
	"rejected_count" integer DEFAULT 0,
	"completed_count" integer DEFAULT 0,
	"remaining_count" integer DEFAULT 0,
	"in_progress_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employee_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" date NOT NULL,
	"department_id" integer,
	"full_time_count" integer DEFAULT 0,
	"part_time_count" integer DEFAULT 0,
	"contractor_count" integer DEFAULT 0,
	"total_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_roles" ADD CONSTRAINT "opportunity_roles_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ADD CONSTRAINT "opportunity_role_assignments_opportunity_role_id_opportunity_roles_id_fk" FOREIGN KEY ("opportunity_role_id") REFERENCES "public"."opportunity_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ADD CONSTRAINT "opportunity_role_assignments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_applicants_id_fk" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_stats" ADD CONSTRAINT "employee_stats_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;