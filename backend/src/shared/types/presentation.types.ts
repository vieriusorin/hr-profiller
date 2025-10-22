import { TypeOpportunity } from './schema.types';
import { Role } from '../../domain/opportunity/entities/role.entity';

/**
 * @description Presentation type for Opportunity entity.
 * @extends TypeOpportunity
 * @interface OpportunityPresentation
 * @property isHighProbability - Indicates if the opportunity has a high probability (>= 80%)
 * @property duration - Project duration in days
 * @property isExpiringSoon - Indicates if the opportunity is expiring within 30 days
 * @property roles - List of roles associated with the opportunity
 */
export interface OpportunityPresentation extends TypeOpportunity {
  isHighProbability: boolean;   // >= 80% probability
  duration: number | null;      // Project duration in days
  isExpiringSoon: boolean;      // Expiring within 30 days
  roles: Role[];
}

/**
 * @description Presentation type for Employee entity.
 * @interface EmployeePresentation
 * @property id - Person ID for CRUD operations
 * @property personId - Person ID
 * @property firstName - First name of the employee
 * @property lastName - Last name of the employee
 * @property fullName - Full name of the employee
 * @property email - Email address of the employee
 * @property phone - Phone number of the employee
 * @property address - Address of the employee
 * @property city - City of the employee
 * @property country - Country of the employee
 * @property birthDate - Birth date of the employee
 * @property position - Job position of the employee
 * @property employeeStatus - Employment status of the employee
 * @property workStatus - Work status of the employee
 * @property jobGrade - Job grade of the employee
 * @property location - Work location of the employee
 * @property hireDate - Hire date of the employee
 * @property terminationDate - Termination date of the employee
 * @property salary - Salary of the employee
 * @property hourlyRate - Hourly rate of the employee
 * @property managerId - Manager ID of the employee
 * @property yearsOfExperience - Computed years since hire date
 * @property isInactive - Computed from employeeStatus
 * @property isOnBench - Computed from workStatus
 * @property isActive - Whether employment is currently active
 * @property skills - List of skills associated with the employee
 * @property technologies - List of technologies associated with the employee
 * @property education - List of education records associated with the employee
 * @property skills.id - Skill ID
 * @property skills.name - Skill name
 * @property skills.proficiencyLevel - Skill proficiency level
 * @property skills.yearsOfExperience - Skill years of experience
 * @property skills.lastUsed - Skill last used date
 * @property skills.isCertified - Indicates if the skill is certified
 * @property skills.certificationName - Certification name for the skill
 * @property skills.certificationDate - Certification date for the skill
 * @property skills.notes - Additional notes about the skill
 * @property technologies.id - Technology ID
 * @property technologies.name - Technology name
 * @property technologies.proficiencyLevel - Technology proficiency level
 * @property technologies.yearsOfExperience - Technology years of experience
 * @property technologies.lastUsed - Technology last used date
 * @property technologies.context - Context of technology usage
 * @property technologies.projectName - Project name where the technology was used
 * @property technologies.description - Description of the technology usage
 * @property education.id - Education record ID
 * @property education.institution - Educational institution name
 * @property education.degree - Degree obtained
 * @property education.fieldOfStudy - Field of study
 * @property education.startDate - Education start date
 * @property education.graduationDate - Graduation date
 * @property education.gpa - Grade Point Average
 * @property education.description - Description of the education record
 * @property education.isCurrentlyEnrolled - Indicates if currently enrolled
 */
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
  jobGrade?: 'JT' | 'T' | 'ST' | 'EN' | 'SE' | 'C' | 'SC' | 'SM' | null;
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