import { z } from 'zod';
import { insertPersonSchema, selectPersonSchema } from './people.schema';
import { insertEmploymentDetailsSchema, selectEmploymentDetailsSchema } from './employment-details.schema';

// Schema for creating a new employee (combines person + employment details)
export const CreateEmployeeSchema = z.object({
  // Person fields (required for employee creation)
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Valid email is required').max(255),
  phone: z.string().max(20).optional(),
  birthDate: z.string().optional(), // Will be converted to Date
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  personNotes: z.string().optional(),
  
  // Employment details fields (required for employee)
  hireDate: z.string().min(1, 'Hire date is required'), // Will be converted to Date
  position: z.string().min(1, 'Position is required').max(100),
  employmentType: z.string().max(50).optional(),
  salary: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  managerId: z.string().uuid().optional(),
  employeeStatus: z.enum(['Active', 'On Leave', 'Inactive']).default('Active'),
  workStatus: z.enum(['On Project', 'On Bench', 'Available']).default('Available'),
  jobGrade: z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']).optional(),
  location: z.string().max(100).optional(),
  emergencyContactName: z.string().max(255).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
  employmentNotes: z.string().optional(),
});

// Schema for updating an employee (all fields optional except ID)
export const UpdateEmployeeSchema = z.object({
  // Person fields
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  personNotes: z.string().optional(),
  
  // Employment details fields
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  position: z.string().min(1).max(100).optional(),
  employmentType: z.string().max(50).optional(),
  salary: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  managerId: z.string().uuid().optional(),
  employeeStatus: z.enum(['Active', 'On Leave', 'Inactive']).optional(),
  workStatus: z.enum(['On Project', 'On Bench', 'Available']).optional(),
  jobGrade: z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']).optional(),
  location: z.string().max(100).optional(),
  emergencyContactName: z.string().max(255).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
  employmentNotes: z.string().optional(),
});

// Type definitions
export type TypeNewEmployee = z.infer<typeof CreateEmployeeSchema>;
export type TypeUpdateEmployee = z.infer<typeof UpdateEmployeeSchema>; 