import { Grade, GradeOption } from "@/lib/types";

export const GRADE_OPTIONS: GradeOption[] = [
  { value: 'JT', label: 'JT - Junior Technician' },
  { value: 'T', label: 'T - Technician' },
  { value: 'ST', label: 'ST - Senior Technician' },
  { value: 'EN', label: 'EN - Engineer' },
  { value: 'SE', label: 'SE - Senior Engineer' },
  { value: 'C', label: 'C - Consultant' },
  { value: 'SC', label: 'SC - Senior Consultant' },
  { value: 'SM', label: 'SM - Senior Manager' }
];

export const GRADE_LABELS: Record<Grade, string> = {
  JT: 'Junior Technician',
  T: 'Technician',
  ST: 'Senior Technician',
  EN: 'Engineer',
  SE: 'Senior Engineer',
  C: 'Consultant',
  SC: 'Senior Consultant',
  SM: 'Senior Manager'
}; 
