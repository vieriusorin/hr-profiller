import { pgTable, varchar, timestamp, integer, boolean, serial, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { meetings } from './meetings.schema';
import { employees } from './employees.schema';
import { candidates } from './candidates.schema';
import { clients } from './clients.schema';

/**
 * Meeting Participants table
 *
 * @description
 * This is a table for meeting participants.
 * It stores information about who is attending meetings.
 */
export const meetingParticipants = pgTable('meeting_participants', {
  id: serial('id').primaryKey(),
  meetingId: integer('meeting_id').notNull().references(() => meetings.id),
  participantType: varchar('participant_type', { length: 50 }).notNull(),
  employeeId: integer('employee_id').references(() => employees.id),
  candidateId: integer('candidate_id').references(() => candidates.id),
  clientId: integer('client_id').references(() => clients.id),
  externalEmail: varchar('external_email', { length: 255 }),
  externalName: varchar('external_name', { length: 255 }),

  isOrganizer: boolean('is_organizer').default(false),
  isRequired: boolean('is_required').default(true),
  responseStatus: varchar('response_status', { length: 50 }).default('pending'),
  role: text('role'),
  status: text('status', { enum: ['Accepted', 'Declined', 'Tentative', 'Needs Action'] }),

  createdAt: timestamp('created_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(meetingParticipants);

// Create a modified insert schema
export const insertMeetingParticipantSchema = baseInsertSchema.omit({
  createdAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(meetingParticipants);

// Create a modified select schema
export const selectMeetingParticipantSchema = baseSelectSchema;

export type TypeMeetingParticipant = z.infer<typeof selectMeetingParticipantSchema>;
export type TypeNewMeetingParticipant = z.infer<typeof insertMeetingParticipantSchema>;