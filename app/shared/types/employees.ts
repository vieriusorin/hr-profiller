import { z } from 'zod';

export const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  position: z.string(),
  department: z.string(),
  employeeStatus: z.string(),
  workStatus: z.string(),
  hireDate: z.string(),
  jobGrade: z.string(),
  location: z.string(),
});

export type Employee = z.infer<typeof EmployeeSchema>; 