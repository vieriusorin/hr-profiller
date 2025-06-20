import { TypeEmployeeStatus } from '../../../../db/enums/employee-status.enum';
import { TypeWorkStatus } from '../../../../db/enums/work-status.enum';
import { TypeJobGrade } from '../../../../db/enums/job-grade.enum';

// Related entity types for Employee
export type EmployeeSkill = {
  skillId: string;
  skillName: string;
  skillCategory?: string | null;
  skillDescription?: string | null;
  proficiencyLevel?: string | null;
  yearsOfExperience?: string | null;
  lastUsed?: Date | null;
  isCertified?: boolean;
  certificationName?: string | null;
  certificationDate?: Date | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EmployeeTechnology = {
  technologyId: string;
  technologyName: string;
  technologyCategory?: string | null;
  technologyDescription?: string | null;
  technologyVersion?: string | null;
  proficiencyLevel?: string | null;
  yearsOfExperience?: string | null;
  lastUsed?: Date | null;
  context?: string | null;
  projectName?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EmployeeEducation = {
  id: string;
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate?: Date | null;
  graduationDate?: Date | null;
  description?: string | null;
  gpa?: string | null;
  isCurrentlyEnrolled?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

// Type for the joined employee data from people + employment_details
export type EmployeeJoinedData = {
  // From people table
  personId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: Date | null;
  address: string | null;
  city: string | null;
  country: string | null;
  personNotes: string | null;
  personCreatedAt: Date;
  // From employment_details table
  employmentDetailsId: string | null;
  employeeId: string | null;
  hireDate: Date | null;
  terminationDate: Date | null;
  position: string | null;
  employmentType: string | null;
  salary: number | null;
  hourlyRate: number | null;
  managerId: string | null;
  employeeStatus: string | null;
  workStatus: string | null;
  jobGrade: string | null;
  location: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  employmentNotes: string | null;
  employmentCreatedAt: Date | null;
  employmentUpdatedAt: Date | null;
};

export class Employee {
  // Properties from people table
  readonly personId!: string;
  readonly firstName!: string;
  readonly lastName!: string;
  readonly email!: string;
  readonly phone!: string | null;
  readonly birthDate!: Date | null;
  readonly address!: string | null;
  readonly city!: string | null;
  readonly country!: string | null;
  readonly personNotes!: string | null;
  readonly personCreatedAt!: Date;
  
  // Properties from employment_details table
  readonly employmentDetailsId!: string | null;
  readonly employeeId!: string | null;
  readonly hireDate!: Date | null;
  readonly terminationDate!: Date | null;
  readonly position!: string | null;
  readonly employmentType!: string | null;
  readonly salary!: number | null;
  readonly hourlyRate!: number | null;
  readonly managerId!: string | null;
  readonly employeeStatus!: TypeEmployeeStatus | null;
  readonly workStatus!: TypeWorkStatus | null;
  readonly jobGrade!: TypeJobGrade | null;
  readonly location!: string | null;
  readonly emergencyContactName!: string | null;
  readonly emergencyContactPhone!: string | null;
  readonly employmentNotes!: string | null;
  readonly employmentCreatedAt!: Date | null;
  readonly employmentUpdatedAt!: Date | null;

  // Related entities for RAG functionality
  public skills: EmployeeSkill[] = [];
  public technologies: EmployeeTechnology[] = [];
  public education: EmployeeEducation[] = [];

  constructor(data: EmployeeJoinedData) {
    Object.assign(this, data);
  }

  // Getter for consistent ID field for CRUD operations
  get id(): string {
    return this.personId;
  }

  // Computed fullName from firstName and lastName
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Computed fields for years of experience
  get yearsOfExperience(): number {
    if (!this.hireDate) return 0;
    const now = new Date();
    const hireDate = new Date(this.hireDate);
    return Math.floor((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  }

  isInactive(): boolean {
    return this.employeeStatus === 'Inactive';
  }

  isOnBench(): boolean {
    return this.workStatus === 'On Bench';
  }

  // Methods for RAG functionality - to get searchable content
  getSkillsText(): string {
    return this.skills.map(skill => 
      `${skill.skillName} (${skill.skillCategory || 'General'}) - ${skill.proficiencyLevel || 'Unknown level'} - ${skill.yearsOfExperience || '0'} years experience${skill.notes ? ` - ${skill.notes}` : ''}`
    ).join('; ');
  }

  getTechnologiesText(): string {
    return this.technologies.map(tech => 
      `${tech.technologyName} ${tech.technologyVersion ? `v${tech.technologyVersion}` : ''} (${tech.technologyCategory || 'General'}) - ${tech.proficiencyLevel || 'Unknown level'} - ${tech.yearsOfExperience || '0'} years experience${tech.context ? ` in ${tech.context}` : ''}${tech.description ? ` - ${tech.description}` : ''}`
    ).join('; ');
  }

  getEducationText(): string {
    return this.education.map(edu => 
      `${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Field'} from ${edu.institution}${edu.gpa ? ` (GPA: ${edu.gpa})` : ''}${edu.description ? ` - ${edu.description}` : ''}`
    ).join('; ');
  }

  // Combined text for RAG search
  getSearchableContent(): string {
    const sections = [
      `Employee: ${this.fullName}`,
      `Position: ${this.position || 'N/A'}`,
      `Location: ${this.location || 'N/A'}`,
      `Skills: ${this.getSkillsText()}`,
      `Technologies: ${this.getTechnologiesText()}`,
      `Education: ${this.getEducationText()}`,
      this.personNotes ? `Notes: ${this.personNotes}` : '',
      this.employmentNotes ? `Employment Notes: ${this.employmentNotes}` : ''
    ].filter(section => section.trim().length > 0);

    return sections.join('\n');
  }
} 