import { pgTable, serial, varchar, timestamp, text, integer, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Meetings table
 *
 * @description
 * This is a table for meetings.
 * It stores information about interviews, team meetings, etc.
 */
export const meetings = pgTable('meetings', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  meetingType: varchar('meeting_type', { length: 50 }).notNull(),
  startDatetime: timestamp('start_datetime').notNull(),
  endDatetime: timestamp('end_datetime').notNull(),
  durationMinutes: integer('duration_minutes'),

  location: varchar('location', { length: 255 }),
  virtualMeetingLink: varchar('virtual_meeting_link', { length: 255 }),
  virtualMeetingId: varchar('virtual_meeting_id', { length: 100 }),
  virtualMeetingPassword: varchar('virtual_meeting_password', { length: 100 }),

  status: varchar('status', { length: 50 }).notNull().default('scheduled'),

  relatedPositionId: integer('related_position_id'),
  relatedCandidateId: integer('related_candidate_id'),
  relatedProjectId: integer('related_project_id'),

  createdById: integer('created_by_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  reminderSent: boolean('reminder_sent').default(false),
  reminderTimeMinutes: integer('reminder_time_minutes'),
  notes: text('notes'),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(meetings);

// Create a modified insert schema that excludes auto-generated fields
export const insertMeetingSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(meetings);

// Create a modified select schema
export const selectMeetingSchema = baseSelectSchema;

export type TypeMeeting = z.infer<typeof selectMeetingSchema>;
export type TypeNewMeeting = z.infer<typeof insertMeetingSchema>;