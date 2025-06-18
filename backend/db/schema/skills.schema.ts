import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Skills table
 *
 * @description
 * This is a table for skills.
 * It stores information about different skills that employees and candidates may have.
 */
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(skills);

// Create a modified insert schema that excludes auto-generated fields
export const insertSkillSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(skills);

// Create a modified select schema
export const selectSkillSchema = baseSelectSchema;

export type TypeSkill = z.infer<typeof selectSkillSchema>;
export type TypeNewSkill = z.infer<typeof insertSkillSchema>;