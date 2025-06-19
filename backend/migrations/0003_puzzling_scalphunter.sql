CREATE TYPE "public"."person_status_type" AS ENUM('candidate', 'employee', 'former_employee', 'inactive');--> statement-breakpoint
CREATE TABLE "people" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"birth_date" date,
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "people_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "person_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"status" "person_status_type" DEFAULT 'candidate' NOT NULL,
	"status_changed_at" timestamp DEFAULT now(),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "person_status_person_id_unique" UNIQUE("person_id")
);
--> statement-breakpoint
CREATE TABLE "employment_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"employee_id" varchar(50),
	"hire_date" date NOT NULL,
	"termination_date" date,
	"department_id" integer,
	"position" varchar(100) NOT NULL,
	"employment_type" varchar(50),
	"salary" numeric(10, 2),
	"hourly_rate" numeric(10, 2),
	"manager_id" integer,
	"employee_status" "employee_status" DEFAULT 'Active' NOT NULL,
	"work_status" "work_status" DEFAULT 'Available' NOT NULL,
	"job_grade" "job_grade",
	"location" varchar(100),
	"emergency_contact_name" varchar(255),
	"emergency_contact_phone" varchar(20),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "employment_details_person_id_unique" UNIQUE("person_id"),
	CONSTRAINT "employment_details_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "person_skills" (
	"person_id" integer NOT NULL,
	"skill_id" integer NOT NULL,
	"proficiency_level" varchar(50),
	"years_of_experience" integer,
	"is_active" varchar(20) DEFAULT 'active',
	"notes" varchar(500),
	"acquired_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "person_skills_person_id_skill_id_pk" PRIMARY KEY("person_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "person_unavailable_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" DROP CONSTRAINT "opportunity_role_assignments_employee_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" DROP CONSTRAINT "opportunity_role_assignments_opportunity_role_id_employee_id_pk";--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ADD CONSTRAINT "opportunity_role_assignments_opportunity_role_id_person_id_pk" PRIMARY KEY("opportunity_role_id","person_id");--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ADD COLUMN "person_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "person_status" ADD CONSTRAINT "person_status_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_details" ADD CONSTRAINT "employment_details_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_details" ADD CONSTRAINT "employment_details_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_details" ADD CONSTRAINT "employment_details_manager_id_people_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_skills" ADD CONSTRAINT "person_skills_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_skills" ADD CONSTRAINT "person_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_unavailable_dates" ADD CONSTRAINT "person_unavailable_dates_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ADD CONSTRAINT "opportunity_role_assignments_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" DROP COLUMN "employee_id";