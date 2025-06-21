import { TypeOpportunity } from './schema.types';
import { Role } from '../../domain/opportunity/entities/role.entity';

/**
 * Opportunity presentation type
 * Base: TypeOpportunity (from schema)
 * + Computed fields from business logic
 */
export interface OpportunityPresentation extends TypeOpportunity {
  isHighProbability: boolean;   // >= 80% probability
  duration: number | null;      // Project duration in days
  isExpiringSoon: boolean;      // Expiring within 30 days
  roles: Role[];
}

export interface EmployeePresentation {
  id: string;                   // Person ID for CRUD operations
  personId: string;             // Person ID
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string;

  // Employment details
  position?: string;
  employeeStatus?: string;
  workStatus?: string;
  jobGrade?: string;
  location?: string;
  hireDate?: string;
  terminationDate?: string;
  salary?: number;
  hourlyRate?: number;
  managerId?: string;

  // Computed fields
  yearsOfExperience: number;    // Computed years since hire date
  isInactive: boolean;          // Computed from employeeStatus
  isOnBench: boolean;           // Computed from workStatus
  isActive: boolean;            // Whether employment is currently active

  // Related data (when included)
  skills?: Array<{
    id: string;
    name: string;
    proficiencyLevel?: string;
    yearsOfExperience?: number;
    lastUsed?: string;
    isCertified?: boolean;
    certificationName?: string;
    certificationDate?: string;
    notes?: string;
  }>;

  technologies?: Array<{
    id: string;
    name: string;
    proficiencyLevel?: string;
    yearsOfExperience?: number;
    lastUsed?: string;
    context?: string;
    projectName?: string;
    description?: string;
  }>;

  education?: Array<{
    id: string;
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    graduationDate?: string;
    gpa?: string;
    description?: string;
    isCurrentlyEnrolled?: boolean;
  }>;
}