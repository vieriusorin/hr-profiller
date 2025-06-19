import { pgTable, uuid, varchar, timestamp, text, date, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { people } from './people.schema';
import { employeeStatusEnum } from '../enums/employee-status.enum';
import { workStatusEnum } from '../enums/work-status.enum';
import { jobGradeEnum } from '../enums/job-grade.enum';

/**
 * Employment Details table
 *
 * @description
 * This table stores employment-specific information.
 * It only contains records for people who have status = 'employee'.
 * When someone is no longer an employee, we can keep this record for history.
 */
export const employmentDetails = pgTable('employment_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id')
    .references(() => people.id)
    .notNull()
    .unique(), // Each person can only have one current employment record
  
  // Employment identification
  employeeId: varchar('employee_id', { length: 50 }).unique(),
  
  // Employment dates and terms
  hireDate: date('hire_date').notNull(),
  terminationDate: date('termination_date'),
  
  // Position and department
  position: varchar('position', { length: 100 }).notNull(),
  employmentType: varchar('employment_type', { length: 50 }),
  
  // Compensation
  salary: decimal('salary', { precision: 10, scale: 2 }),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  
  // Management structure
  managerId: uuid('manager_id')
    .references(() => people.id), // References people, not employees
  
  // Current status and work assignment
  employeeStatus: employeeStatusEnum('employee_status').notNull().default('Active'),
  workStatus: workStatusEnum('work_status').notNull().default('Available'),
  jobGrade: jobGradeEnum('job_grade'),
  location: varchar('location', { length: 100 }),
  
  // Emergency contact
  emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  
  // Additional info
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(employmentDetails);

// Create a modified insert schema that excludes auto-generated fields
export const insertEmploymentDetailsSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(employmentDetails);

// Create a modified select schema
export const selectEmploymentDetailsSchema = baseSelectSchema;

export type TypeEmploymentDetails = z.infer<typeof selectEmploymentDetailsSchema>;
export type TypeNewEmploymentDetails = z.infer<typeof insertEmploymentDetailsSchema>; 