import { pgTable, integer, varchar, boolean, date, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Employee Skills table
 *
 * @description
 * This is a junction table for employees and skills.
 * It stores which skills each employee has.
 */
export const employeeSkills = pgTable('employee_skills', {
  employeeId: integer('employee_id').notNull(),
  skillId: integer('skill_id').notNull(),
  proficiencyLevel: varchar('proficiency_level', { length: 50 }),
  yearsOfExperience: integer('years_of_experience'),
  isCertified: boolean('is_certified').default(false),
  certificationName: varchar('certification_name', { length: 255 }),
  certificationDate: date('certification_date'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.employeeId, table.skillId] }),
  };
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(employeeSkills);

// Create a modified insert schema
export const insertEmployeeSkillSchema = baseInsertSchema.omit({
  createdAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(employeeSkills);

// Create a modified select schema
export const selectEmployeeSkillSchema = baseSelectSchema;

export type TypeEmployeeSkill = z.infer<typeof selectEmployeeSkillSchema>;
export type TypeNewEmployeeSkill = z.infer<typeof insertEmployeeSkillSchema>;