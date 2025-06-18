import { pgTable, serial, varchar, timestamp, text, date, decimal, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Employees table
 *
 * @description
 * This is a table for the employees.
 * It stores all employee information.
 */
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id'),
  employeeId: varchar('employee_id', { length: 50 }).unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  birthDate: date('birth_date'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),

  hireDate: date('hire_date').notNull(),
  departmentId: integer('department_id'),
  position: varchar('position', { length: 100 }).notNull(),
  employmentType: varchar('employment_type', { length: 50 }),
  salary: decimal('salary', { precision: 10, scale: 2 }),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),

  managerId: integer('manager_id'),
  status: varchar('status', { length: 50 }).notNull(),
  terminationDate: date('termination_date'),

  emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(employees);

// Create a modified insert schema that excludes auto-generated fields
export const insertEmployeeSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(employees);

// Create a modified select schema
export const selectEmployeeSchema = baseSelectSchema;

export type TypeEmployee = z.infer<typeof selectEmployeeSchema>;
export type TypeNewEmployee = z.infer<typeof insertEmployeeSchema>;