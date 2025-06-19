ALTER TABLE "employee_unavailable_dates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "employee_unavailable_dates" CASCADE;--> statement-breakpoint
ALTER TABLE "project_team_members" DROP CONSTRAINT "project_team_members_project_id_employee_id_pk";--> statement-breakpoint
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_project_id_person_id_pk" PRIMARY KEY("project_id","person_id");--> statement-breakpoint
ALTER TABLE "project_team_members" ADD COLUMN "person_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team_members" DROP COLUMN "employee_id";