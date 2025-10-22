import { Person, PersonSkill, PersonTechnology, PersonEducation } from '../../person/entities/person.entity';
import { Employment } from './employment.entity';

/**
 * @description Entity representing a comprehensive employee profile.
 * Combines personal and employment information along with capabilities.
 * Provides convenience methods for accessing and summarizing employee data.
 * @class EmployeeProfile
 * @property person - The Person entity containing personal details.
 * @property employment - The Employment entity containing employment details.
 * @property id - The unique identifier of the employee (from Person).
 * @property fullName - The full name of the employee (from Person).
 * @property email - The email address of the employee (from Person).
 * @property position - The job position of the employee (from Employment).
 * @property location - The work location of the employee (from Employment).
 * @property isActive - Indicates if the employee is currently active (from Employment).
 * @property isAvailable - Indicates if the employee is available for assignment (from Employment).
 * @property skillsText - A formatted string of the employee's skills (from Person).
 * @property technologiesText - A formatted string of the employee's technologies (from Person).
 * @property educationText - A formatted string of the employee's education (from Person).
 * @property getSearchableContent - Method to retrieve searchable content for indexing.
 * @method canBePromoted - Check if the employee can be promoted.
 * @method canBeAssignedToProject - Check if the employee can be assigned to a project. 
 * @method canBeTerminated - Check if the employee can be terminated.
 * @method toSummary - Get a summary of the employee profile.
 * @method toDetailedView - Get a detailed view of the employee profile.
 */
export class EmployeeProfile {
  readonly person: Person;
  readonly employment: Employment;

  constructor(person: Person, employment: Employment) {
    if (person.id !== employment.personId) {
      throw new Error('Person and Employment must belong to the same individual');
    }

    this.person = person;
    this.employment = employment;
  }

  // Convenience getters that delegate to the appropriate domain
  get id(): string {
    return this.person.id;
  }

  get fullName(): string {
    return this.person.displayName;
  }

  get email(): string {
    return this.person.email;
  }

  get position(): string {
    return this.employment.displayPosition;
  }

  get location(): string {
    return this.employment.displayLocation;
  }

  get isActive(): boolean {
    return this.employment.isActive;
  }

  get isAvailable(): boolean {
    return this.employment.isAvailable;
  }

  // Combined display methods
  get displayTitle(): string {
    return `${this.fullName} - ${this.position}`;
  }

  get employeeStatusSummary(): string {
    return `${this.employment.employeeStatus || 'Unknown'} (${this.employment.workStatus || 'Unknown'})`;
  }

  // Skills and capabilities (delegated to Person)
  get skillsText(): string {
    return this.person.getSkillsText();
  }

  get technologiesText(): string {
    return this.person.getTechnologiesText();
  }

  get educationText(): string {
    return this.person.getEducationText();
  }

  /**
   * Get the searchable content for the employee profile.
   * such as for indexing in a search engine.
   * @returns A string containing all relevant information for search indexing.
   */
  getSearchableContent(): string {
    const sections = [
      `Employee: ${this.fullName}`,
      `Position: ${this.position}`,
      `Location: ${this.location}`,
      `Status: ${this.employeeStatusSummary}`,
      `Skills: ${this.skillsText}`,
      `Technologies: ${this.technologiesText}`,
      `Education: ${this.educationText}`,
      this.person.notes ? `Personal Notes: ${this.person.notes}` : '',
      this.employment.notes ? `Employment Notes: ${this.employment.notes}` : ''
    ].filter(section => section.trim().length > 0);

    return sections.join('\n');
  }

  /**
   * Check if the employee can be promoted.
   * @returns True if the employee can be promoted, false otherwise.
   */
  canBePromoted(): boolean {
    return this.employment.isActive;
  }

  /**
   * Check if the employee can be assigned to a project.
   * @returns True if the employee can be assigned to a project, false otherwise.
   */
  canBeAssignedToProject(): boolean {
    return this.employment.isAvailable;
  }

  /**
   * Check if the employee can be terminated.
   * @returns True if the employee can be terminated, false otherwise.
   */
  canBeTerminated(): boolean {
    return this.employment.isActive && !this.employment.isTerminated;
  }

  
  /**
   * Get a summary of the employee profile.
   * @returns An object containing the summary information.
   */
  toSummary(): {
    id: string;
    fullName: string;
    email: string;
    position: string;
    location: string;
    status: string;
    workStatus: string;
    skillsCount: number;
    technologiesCount: number;
    educationCount: number;
  } {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      position: this.position,
      location: this.location,
      status: this.employment.employeeStatus || 'Unknown',
      workStatus: this.employment.workStatus || 'Unknown',
      skillsCount: this.person.skills.length,
      technologiesCount: this.person.technologies.length,
      educationCount: this.person.education.length,
    };
  }

  /**
   * Get a detailed view of the employee profile.
   * @returns An object containing the detailed information.
   */
  toDetailedView(): {
    person: {
      id: string;
      fullName: string;
      email: string;
      phone: string | null;
      address: string | null;
      city: string | null;
      country: string | null;
    };
    employment: {
      employeeId: string | null;
      position: string | null;
      hireDate: Date | null;
      salary: number | null;
      location: string | null;
      status: string | null;
      workStatus: string | null;
    };
    capabilities: {
      skills: PersonSkill[];
      technologies: PersonTechnology[];
      education: PersonEducation[];
    };
  } {
    return {
      person: {
        id: this.person.id,
        fullName: this.person.fullName,
        email: this.person.email,
        phone: this.person.phone,
        address: this.person.address,
        city: this.person.city,
        country: this.person.country,
      },
      employment: {
        employeeId: this.employment.employeeId,
        position: this.employment.position,
        hireDate: this.employment.hireDate,
        salary: this.employment.salary,
        location: this.employment.location,
        status: this.employment.employeeStatus,
        workStatus: this.employment.workStatus,
      },
      capabilities: {
        skills: this.person.skills,
        technologies: this.person.technologies,
        education: this.person.education,
      },
    };
  }
} 