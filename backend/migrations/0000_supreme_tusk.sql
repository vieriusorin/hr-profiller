CREATE TYPE "public"."application_status" AS ENUM('applied', 'screening', 'interview', 'offer', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."department_type" AS ENUM('sales', 'marketing', 'engineering', 'hr', 'finance', 'legal', 'customer_support', 'product', 'design');--> statement-breakpoint
CREATE TYPE "public"."employee_type" AS ENUM('full_time', 'part_time', 'contractor');--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"birth_date" date,
	"city" varchar(100),
	"country" varchar(100),
	"notes" text,
	"hourly_rate" numeric(10, 2),
	"status" varchar(50) DEFAULT 'active',
	"role" varchar(100),
	"department_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "candidates_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer,
	"employee_id" varchar(50),
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"birth_date" date,
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"hire_date" date NOT NULL,
	"department_id" integer,
	"position" varchar(100) NOT NULL,
	"employment_type" varchar(50),
	"salary" numeric(10, 2),
	"hourly_rate" numeric(10, 2),
	"manager_id" integer,
	"status" varchar(50) NOT NULL,
	"termination_date" date,
	"emergency_contact_name" varchar(255),
	"emergency_contact_phone" varchar(20),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "employees_employee_id_unique" UNIQUE("employee_id"),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"manager_id" integer,
	"location" varchar(100),
	"budget" numeric(12, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"meeting_type" varchar(50) NOT NULL,
	"start_datetime" timestamp NOT NULL,
	"end_datetime" timestamp NOT NULL,
	"duration_minutes" integer,
	"location" varchar(255),
	"virtual_meeting_link" varchar(255),
	"virtual_meeting_id" varchar(100),
	"virtual_meeting_password" varchar(100),
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"related_position_id" integer,
	"related_candidate_id" integer,
	"related_project_id" integer,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"reminder_sent" boolean DEFAULT false,
	"reminder_time_minutes" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "meeting_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"meeting_id" integer NOT NULL,
	"participant_type" varchar(50) NOT NULL,
	"employee_id" integer,
	"candidate_id" integer,
	"client_id" integer,
	"external_email" varchar(255),
	"external_name" varchar(255),
	"is_organizer" boolean DEFAULT false,
	"is_required" boolean DEFAULT true,
	"response_status" varchar(50) DEFAULT 'pending',
	"role" text,
	"status" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"industry" varchar(100),
	"contact_person" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"address" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"industry" varchar(100),
	"description" text,
	"budget" numeric(12, 2),
	"start_date" date,
	"end_date" date,
	"employment_type" varchar(50),
	"status" varchar(50),
	"client_id" integer,
	"project_manager_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technologies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "technologies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "project_technologies" (
	"project_id" integer NOT NULL,
	"technology_id" integer NOT NULL,
	"proficiency_required" varchar(50),
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "project_technologies_project_id_technology_id_pk" PRIMARY KEY("project_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "project_team_members" (
	"project_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
	"role" varchar(100),
	"hourly_rate" numeric(10, 2),
	"allocation_percentage" integer,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "project_team_members_project_id_employee_id_pk" PRIMARY KEY("project_id","employee_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "employee_skills" (
	"employee_id" integer NOT NULL,
	"skill_id" integer NOT NULL,
	"proficiency_level" varchar(50),
	"years_of_experience" integer,
	"is_certified" boolean DEFAULT false,
	"certification_name" varchar(255),
	"certification_date" date,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "employee_skills_employee_id_skill_id_pk" PRIMARY KEY("employee_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "candidate_skills" (
	"candidate_id" integer NOT NULL,
	"skill_id" integer NOT NULL,
	"proficiency_level" varchar(50),
	"years_of_experience" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "candidate_skills_candidate_id_skill_id_pk" PRIMARY KEY("candidate_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer,
	"employee_id" integer,
	"institution" varchar(255) NOT NULL,
	"degree" varchar(100),
	"field_of_study" varchar(100),
	"start_date" date,
	"graduation_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "work_experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer,
	"employee_id" integer,
	"job_title" varchar(100) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"location" varchar(100),
	"start_date" date NOT NULL,
	"end_date" date,
	"is_current" boolean DEFAULT false,
	"employment_type" varchar(50),
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"department_id" integer,
	"description" text,
	"requirements" text,
	"status" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;