import { pgTable, integer, varchar, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Candidate Skills table
 *
 * @description
 * This is a junction table for candidates and skills.
 * It stores which skills each candidate has.
 */
export const candidateSkills = pgTable('candidate_skills', {
  candidateId: integer('candidate_id').notNull(),
  skillId: integer('skill_id').notNull(),
  proficiencyLevel: varchar('proficiency_level', { length: 50 }),
  yearsOfExperience: integer('years_of_experience'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.candidateId, table.skillId] }),
  };
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(candidateSkills);

// Create a modified insert schema
export const insertCandidateSkillSchema = baseInsertSchema.omit({
  createdAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(candidateSkills);

// Create a modified select schema
export const selectCandidateSkillSchema = baseSelectSchema;

export type TypeCandidateSkill = z.infer<typeof selectCandidateSkillSchema>;
export type TypeNewCandidateSkill = z.infer<typeof insertCandidateSkillSchema>;