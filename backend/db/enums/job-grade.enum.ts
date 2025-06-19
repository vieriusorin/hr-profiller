import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Job grade enum
 *
 * @description
 * This is an enum for job grades/levels.
 * It represents the seniority and skill level of employees and role requirements.
 */
export const jobGradeEnum = pgEnum('job_grade', [
  'T',      // Trainee
  'C',      // Consultant
  'SC',     // Senior Consultant
  'ST',     // Staff
  'SE',     // Senior Engineer
  'IC3',    // Individual Contributor Level 3
  'IC4',    // Individual Contributor Level 4
  'IC5',    // Individual Contributor Level 5
  'M2',     // Manager Level 2
]);

/**
 * Type for the job grade enum
 * @description
 * This is a type for the job grade enum.
 * It is used to store job grades.
 */
export type TypeJobGrade = (typeof jobGradeEnum.enumValues)[number]; 