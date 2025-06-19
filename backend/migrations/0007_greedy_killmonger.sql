CREATE TABLE "person_technologies" (
	"person_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	"proficiency_level" varchar(50),
	"years_of_experience" varchar(10),
	"last_used" date,
	"context" varchar(100),
	"project_name" varchar(255),
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "person_technologies_person_id_technology_id_pk" PRIMARY KEY("person_id","technology_id")
);
--> statement-breakpoint
ALTER TABLE "departments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "meetings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "meeting_participants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_technologies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_team_members" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "work_experience" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "positions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "applications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "applicants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "application_metrics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "departments" CASCADE;--> statement-breakpoint
DROP TABLE "meetings" CASCADE;--> statement-breakpoint
DROP TABLE "meeting_participants" CASCADE;--> statement-breakpoint
DROP TABLE "projects" CASCADE;--> statement-breakpoint
DROP TABLE "project_technologies" CASCADE;--> statement-breakpoint
DROP TABLE "project_team_members" CASCADE;--> statement-breakpoint
DROP TABLE "work_experience" CASCADE;--> statement-breakpoint
DROP TABLE "positions" CASCADE;--> statement-breakpoint
DROP TABLE "roles" CASCADE;--> statement-breakpoint
DROP TABLE "applications" CASCADE;--> statement-breakpoint
DROP TABLE "applicants" CASCADE;--> statement-breakpoint
DROP TABLE "application_metrics" CASCADE;--> statement-breakpoint
ALTER TABLE "education" DROP CONSTRAINT "education_person_id_people_id_fk";
--> statement-breakpoint
ALTER TABLE "employment_details" DROP CONSTRAINT "employment_details_department_id_departments_id_fk";
--> statement-breakpoint
ALTER TABLE "person_skills" DROP CONSTRAINT "person_skills_person_id_people_id_fk";
--> statement-breakpoint
ALTER TABLE "person_skills" DROP CONSTRAINT "person_skills_skill_id_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "technologies" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "technologies" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "skills" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "skills" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "education" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "education" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "education" ALTER COLUMN "person_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "opportunities" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "opportunities" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "opportunities" ALTER COLUMN "client_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "opportunity_roles" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "opportunity_roles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "opportunity_roles" ALTER COLUMN "opportunity_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ALTER COLUMN "opportunity_role_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "opportunity_role_assignments" ALTER COLUMN "person_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "people" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "people" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "person_status" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "person_status" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "person_status" ALTER COLUMN "person_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "employment_details" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "employment_details" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "employment_details" ALTER COLUMN "person_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "employment_details" ALTER COLUMN "manager_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "person_skills" ALTER COLUMN "person_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "person_skills" ALTER COLUMN "skill_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "person_skills" ALTER COLUMN "years_of_experience" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "person_skills" ALTER COLUMN "notes" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "person_unavailable_dates" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "person_unavailable_dates" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "person_unavailable_dates" ALTER COLUMN "person_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "technologies" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "technologies" ADD COLUMN "version" varchar(20);--> statement-breakpoint
ALTER TABLE "technologies" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "category" varchar(50);--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "gpa" varchar(10);--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "is_currently_enrolled" varchar(10) DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "person_skills" ADD COLUMN "last_used" date;--> statement-breakpoint
ALTER TABLE "person_skills" ADD COLUMN "is_certified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "person_skills" ADD COLUMN "certification_name" varchar(255);--> statement-breakpoint
ALTER TABLE "person_skills" ADD COLUMN "certification_date" date;--> statement-breakpoint
ALTER TABLE "person_technologies" ADD CONSTRAINT "person_technologies_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_technologies" ADD CONSTRAINT "person_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education" ADD CONSTRAINT "education_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_skills" ADD CONSTRAINT "person_skills_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_skills" ADD CONSTRAINT "person_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_details" DROP COLUMN "department_id";--> statement-breakpoint
ALTER TABLE "person_skills" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "person_skills" DROP COLUMN "acquired_at";--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
DROP TYPE "public"."department_type";--> statement-breakpoint
DROP TYPE "public"."employee_type";