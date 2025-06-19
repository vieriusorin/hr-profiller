import { pgTable, uuid, varchar, date, timestamp, text } from 'drizzle-orm/pg-core';
import { people } from './people.schema';

export const education = pgTable('education', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  institution: varchar('institution', { length: 255 }).notNull(),
  degree: varchar('degree', { length: 100 }),
  fieldOfStudy: varchar('field_of_study', { length: 100 }),
  startDate: date('start_date'),
  graduationDate: date('graduation_date'),
  description: text('description'),
  gpa: varchar('gpa', { length: 10 }),
  isCurrentlyEnrolled: varchar('is_currently_enrolled', { length: 10 }).default('false'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Education = typeof education.$inferSelect;
export type NewEducation = typeof education.$inferInsert; 