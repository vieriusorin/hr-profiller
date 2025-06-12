import { Grade, GradeOption } from "../../types";

export const GRADE_OPTIONS: GradeOption[] = [
  { value: 'JT', label: 'JT - Junior Trainee' },
  { value: 'T', label: 'T - Trainee' },
  { value: 'ST', label: 'ST - Senior Trainee' },
  { value: 'EN', label: 'EN - Engineer' },
  { value: 'SE', label: 'SE - Senior Engineer' },
  { value: 'C', label: 'C - Consultant' },
  { value: 'SC', label: 'SC - Senior Consultant' },
  { value: 'SM', label: 'SM - Senior Manager' }
];

export const GRADE_LABELS: Record<Grade, string> = {
  JT: 'Junior Trainee',
  T: 'Trainee',
  ST: 'Senior Trainee',
  EN: 'Engineer',
  SE: 'Senior Engineer',
  C: 'Consultant',
  SC: 'Senior Consultant',
  SM: 'Senior Manager'
}; 
