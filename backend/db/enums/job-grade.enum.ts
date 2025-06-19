import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Job grade enum
 *
 * @description
 * This is an enum for job grades/levels.
 * It represents the seniority and skill level of employees and role requirements.
 */
export const jobGradeEnum = pgEnum('job_grade', [
  'JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'
]);

/**
 * Type for the job grade enum
 * @description
 * This is a type for the job grade enum.
 * It is used to store job grades.
 */
export type TypeJobGrade = (typeof jobGradeEnum.enumValues)[number]; 