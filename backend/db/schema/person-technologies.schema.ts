import { pgTable, uuid, varchar, date, timestamp, text, primaryKey } from 'drizzle-orm/pg-core';
import { people } from './people.schema';
import { technologies } from './technologies.schema';

export const personTechnologies = pgTable('person_technologies', {
  personId: uuid('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  technologyId: uuid('technology_id').notNull().references(() => technologies.id, { onDelete: 'cascade' }),
  proficiencyLevel: varchar('proficiency_level', { length: 50 }), // Beginner, Intermediate, Advanced, Expert
  yearsOfExperience: varchar('years_of_experience', { length: 10 }),
  lastUsed: date('last_used'),
  context: varchar('context', { length: 100 }), // Work, Personal Project, Certification, etc.
  projectName: varchar('project_name', { length: 255 }),
  description: text('description'), // How they used this technology
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.personId, table.technologyId] }),
  };
});

export type PersonTechnology = typeof personTechnologies.$inferSelect;
export type NewPersonTechnology = typeof personTechnologies.$inferInsert; 