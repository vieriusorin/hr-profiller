import { pgTable, uuid, varchar, boolean, date, timestamp, text, primaryKey } from 'drizzle-orm/pg-core';
import { people } from './people.schema';
import { skills } from './skills.schema';

export const personSkills = pgTable('person_skills', {
  personId: uuid('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  proficiencyLevel: varchar('proficiency_level', { length: 50 }), // Beginner, Intermediate, Advanced, Expert
  yearsOfExperience: varchar('years_of_experience', { length: 10 }),
  lastUsed: date('last_used'),
  isCertified: boolean('is_certified').default(false),
  certificationName: varchar('certification_name', { length: 255 }),
  certificationDate: date('certification_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.personId, table.skillId] }),
  };
});

export type PersonSkill = typeof personSkills.$inferSelect;
export type NewPersonSkill = typeof personSkills.$inferInsert; 