import { Person, PersonSkill, PersonTechnology, PersonEducation } from '../../person/entities/person.entity';
import { Employment } from './employment.entity';

/**
 * EmployeeProfile - A composite entity that combines Person and Employment
 * This is used for presentation and cross-domain operations
 * It doesn't contain its own business logic but delegates to the appropriate domains
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

  // Combined searchable content for RAG functionality
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

  // Validation methods
  canBePromoted(): boolean {
    return this.employment.isActive;
  }

  canBeAssignedToProject(): boolean {
    return this.employment.isAvailable;
  }

  canBeTerminated(): boolean {
    return this.employment.isActive && !this.employment.isTerminated;
  }

  // Utility methods for presentation
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