import { z } from 'zod';

// Helper function to trim strings and convert empty strings to null
const stringPreprocess = (val: unknown) => {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed === '' ? null : trimmed;
  }
  return val;
};

// Helper function for optional strings that should be trimmed
const optionalTrimmedString = (maxLength?: number) => {
  let schema = z.preprocess(stringPreprocess, z.string().nullable()).optional();
  if (maxLength) {
    schema = z.preprocess(stringPreprocess, z.string().max(maxLength).nullable()).optional();
  }
  return schema;
};

// Helper function for required strings that should be trimmed
const requiredTrimmedString = (minLength: number = 1, maxLength?: number) => {
  let schema = z.preprocess(
    stringPreprocess, 
    z.string().min(minLength, 'This field is required')
  );
  if (maxLength) {
    schema = z.preprocess(
      stringPreprocess, 
      z.string().min(minLength, 'This field is required').max(maxLength)
    );
  }
  return schema;
};

// Base schema with transforms
const BaseEmployeeSchema = z.object({
  // Person fields with automatic trimming and validation
  firstName: requiredTrimmedString(1, 100),
  lastName: requiredTrimmedString(1, 100),
  email: z.preprocess(
    (val) => typeof val === 'string' ? val.trim().toLowerCase() : val,
    z.string().email('Invalid email address').max(255)
  ),
  phone: optionalTrimmedString(20),
  birthDate: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? null : val,
    z.string().nullable().transform(val => val ? new Date(val) : null)
  ).optional(),
  address: optionalTrimmedString(),
  city: optionalTrimmedString(100),
  country: optionalTrimmedString(100),
  personNotes: optionalTrimmedString(),
  
  // Employment details fields with transforms
  hireDate: z.preprocess(
    stringPreprocess,
    z.string().transform(val => new Date(val))
  ),
  terminationDate: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? null : val,
    z.string().nullable().transform(val => val ? new Date(val) : null)
  ).optional(),
  position: requiredTrimmedString(1, 100),
  employmentType: optionalTrimmedString(50),
  salary: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  managerId: z.preprocess(
    stringPreprocess,
    z.string().uuid().nullable()
  ).optional(),
  employeeStatus: z.preprocess(
    stringPreprocess,
    z.enum(['Active', 'On Leave', 'Inactive'])
  ).default('Active'),
  workStatus: z.preprocess(
    stringPreprocess,
    z.enum(['On Project', 'On Bench', 'Available'])
  ).default('Available'),
  jobGrade: z.preprocess(
    stringPreprocess,
    z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']).nullable()
  ).optional(),
  location: optionalTrimmedString(100),
  emergencyContactName: optionalTrimmedString(255),
  emergencyContactPhone: optionalTrimmedString(20),
  employmentNotes: optionalTrimmedString(),
});

// Create schema - specify required fields and defaults
export const CreateEmployeeSchema = BaseEmployeeSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  hireDate: true,
  position: true,
}).extend({
  phone: BaseEmployeeSchema.shape.phone,
  birthDate: BaseEmployeeSchema.shape.birthDate,
  address: BaseEmployeeSchema.shape.address,
  city: BaseEmployeeSchema.shape.city,
  country: BaseEmployeeSchema.shape.country,
  personNotes: BaseEmployeeSchema.shape.personNotes,
  employmentType: BaseEmployeeSchema.shape.employmentType,
  salary: BaseEmployeeSchema.shape.salary,
  hourlyRate: BaseEmployeeSchema.shape.hourlyRate,
  managerId: BaseEmployeeSchema.shape.managerId,
  employeeStatus: BaseEmployeeSchema.shape.employeeStatus,
  workStatus: BaseEmployeeSchema.shape.workStatus,
  jobGrade: BaseEmployeeSchema.shape.jobGrade,
  location: BaseEmployeeSchema.shape.location,
  emergencyContactName: BaseEmployeeSchema.shape.emergencyContactName,
  emergencyContactPhone: BaseEmployeeSchema.shape.emergencyContactPhone,
  employmentNotes: BaseEmployeeSchema.shape.employmentNotes,
}).refine(
  (data) => !data.salary || !data.hourlyRate,
  {
    message: "Employee cannot have both salary and hourly rate",
    path: ["salary"],
  }
);

// Update schema - all fields optional with transforms
export const UpdateEmployeeSchema = BaseEmployeeSchema.partial();

// Separate schemas for database updates
export const PersonUpdateSchema = z.object({
  firstName: BaseEmployeeSchema.shape.firstName.optional(),
  lastName: BaseEmployeeSchema.shape.lastName.optional(),
  email: BaseEmployeeSchema.shape.email.optional(),
  phone: BaseEmployeeSchema.shape.phone,
  birthDate: BaseEmployeeSchema.shape.birthDate,
  address: BaseEmployeeSchema.shape.address,
  city: BaseEmployeeSchema.shape.city,
  country: BaseEmployeeSchema.shape.country,
  notes: BaseEmployeeSchema.shape.personNotes, // maps to notes in DB
  updatedAt: z.date().default(() => new Date()),
}).partial();

export const EmploymentUpdateSchema = z.object({
  hireDate: BaseEmployeeSchema.shape.hireDate.optional(),
  terminationDate: BaseEmployeeSchema.shape.terminationDate,
  position: BaseEmployeeSchema.shape.position.optional(),
  employmentType: BaseEmployeeSchema.shape.employmentType,
  salary: z.number().positive().transform(val => val.toString()).optional(),
  hourlyRate: z.number().positive().transform(val => val.toString()).optional(),
  managerId: BaseEmployeeSchema.shape.managerId,
  employeeStatus: BaseEmployeeSchema.shape.employeeStatus.optional(),
  workStatus: BaseEmployeeSchema.shape.workStatus.optional(),
  jobGrade: BaseEmployeeSchema.shape.jobGrade,
  location: BaseEmployeeSchema.shape.location,
  emergencyContactName: BaseEmployeeSchema.shape.emergencyContactName,
  emergencyContactPhone: BaseEmployeeSchema.shape.emergencyContactPhone,
  notes: BaseEmployeeSchema.shape.employmentNotes, // maps to notes in DB
  updatedAt: z.date().default(() => new Date()),
}).partial();

// Type definitions
export type TypeNewEmployee = z.infer<typeof CreateEmployeeSchema>;
export type TypeUpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
export type TypePersonUpdate = z.infer<typeof PersonUpdateSchema>;
export type TypeEmploymentUpdate = z.infer<typeof EmploymentUpdateSchema>;

export const EmployeeIdSchema = z.string().uuid('Invalid employee ID format');