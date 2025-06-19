ALTER TABLE "candidates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "employees" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "employee_skills" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "candidate_skills" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "employee_stats" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "candidates" CASCADE;--> statement-breakpoint
DROP TABLE "employees" CASCADE;--> statement-breakpoint
DROP TABLE "employee_skills" CASCADE;--> statement-breakpoint
DROP TABLE "candidate_skills" CASCADE;--> statement-breakpoint
DROP TABLE "employee_stats" CASCADE;--> statement-breakpoint
ALTER TABLE "meeting_participants" DROP CONSTRAINT "meeting_participants_employee_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "meeting_participants" DROP CONSTRAINT "meeting_participants_candidate_id_candidates_id_fk";
--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "related_person_id" integer;--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD COLUMN "person_id" integer;--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "person_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "work_experience" ADD COLUMN "person_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education" ADD CONSTRAINT "education_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_experience" ADD CONSTRAINT "work_experience_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" DROP COLUMN "related_candidate_id";--> statement-breakpoint
ALTER TABLE "meeting_participants" DROP COLUMN "employee_id";--> statement-breakpoint
ALTER TABLE "meeting_participants" DROP COLUMN "candidate_id";--> statement-breakpoint
ALTER TABLE "education" DROP COLUMN "candidate_id";--> statement-breakpoint
ALTER TABLE "education" DROP COLUMN "employee_id";--> statement-breakpoint
ALTER TABLE "work_experience" DROP COLUMN "candidate_id";--> statement-breakpoint
ALTER TABLE "work_experience" DROP COLUMN "employee_id";