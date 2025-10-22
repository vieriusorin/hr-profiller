// Person Domain Entity - Contains personal identity and capabilities

/**
 * @description Data structure for a person's skill.
 * @type PersonSkill
 * @property skillId - Unique identifier for the skill.
 * @property skillName - Name of the skill.
 * @property skillCategory - Category of the skill.
 * @property skillDescription - Description of the skill.
 * @property proficiencyLevel - Proficiency level in the skill.
 * @property yearsOfExperience - Years of experience with the skill.
 * @property lastUsed - Date when the skill was last used.
 * @property isCertified - Indicates if the skill is certified.
 * @property certificationName - Name of the certification.
 * @property certificationDate - Date of the certification.
 * @property notes - Additional notes about the skill.
 * @property createdAt - Timestamp of when the skill was added.
 * @property updatedAt - Timestamp of the last update to the skill.
 */
export type PersonSkill = {
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

/**
 * @description Data structure for a person's technology.
 * @type PersonTechnology
 * @property technologyId - Unique identifier for the technology.
 * @property technologyName - Name of the technology.
 * @property technologyCategory - Category of the technology.
 * @property technologyDescription - Description of the technology.
 * @property technologyVersion - Version of the technology.
 * @property proficiencyLevel - Proficiency level in the technology.
 * @property yearsOfExperience - Years of experience with the technology.
 * @property lastUsed - Date when the technology was last used.
 * @property context - Context in which the technology was used.
 * @property projectName - Name of the project where the technology was used.
 * @property description - Additional description about the technology usage.
 * @property createdAt - Timestamp of when the technology was added.
 * @property updatedAt - Timestamp of the last update to the technology.
 */
export type PersonTechnology = {
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

/**
 * @description Data structure for a person's education.
 * @type PersonEducation
 * @property id - Unique identifier for the education record.
 * @property institution - Name of the educational institution.
 * @property degree - Degree obtained.
 * @property fieldOfStudy - Field of study.
 * @property startDate - Start date of the education.
 * @property graduationDate - Graduation date.
 * @property description - Additional description about the education.
 * @property gpa - Grade Point Average.
 * @property isCurrentlyEnrolled - Indicates if the person is currently enrolled.
 * @property createdAt - Timestamp of when the education record was added.
 * @property updatedAt - Timestamp of the last update to the education record.
 */
export type PersonEducation = {
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

/**
 * @description Data structure for Person entity.
 * Includes personal identity and contact information.
 * @type PersonData
 * @property id - Unique identifier for the person.
 * @property firstName - First name of the person.
 * @property lastName - Last name of the person.
 * @property fullName - Full name of the person.
 * @property email - Email address of the person.
 * @property phone - Phone number of the person.
 * @property birthDate - Birth date of the person.
 * @property address - Address of the person.
 * @property city - City of residence.
 * @property country - Country of residence.
 * @property notes - Additional notes about the person.
 * @property createdAt - Timestamp of when the person record was created.
 * @property updatedAt - Timestamp of the last update to the person record.
 */
export type PersonData = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  birthDate?: Date | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
};

/**
 * @class Person
 * @description Entity representing a person with identity and capabilities.
 * Includes business logic related to personal information and skills management.
 * @property id - Unique identifier for the person.
 * @property firstName - First name of the person.
 * @property lastName - Last name of the person.
 * @property fullName - Full name of the person.
 * @property email - Email address of the person.
 * @property phone - Phone number of the person.
 * @property birthDate - Birth date of the person.
 * @property address - Address of the person.
 * @property city - City of residence.
 * @property country - Country of residence.
 * @property notes - Additional notes about the person.
 * @property createdAt - Timestamp of when the person record was created.
 * @property updatedAt - Timestamp of the last update to the person record.
 * @property skills - List of skills associated with the person.
 * @property technologies - List of technologies associated with the person.
 * @property education - List of education records associated with the person.
 * @property displayName - Computed property for the person's display name.
 * @method addSkill - Adds a new skill to the person.
 * @method updateSkill - Updates an existing skill of the person.
 * @method removeSkill - Removes a skill from the person.
 * @method getSkillsByCategory - Retrieves skills by category.
 * @method addTechnology - Adds a new technology to the person.
 * @method updateTechnology - Updates an existing technology of the person.
 * @method removeTechnology - Removes a technology from the person.
 * @method getTechnologiesByCategory - Retrieves technologies by category.
 * @method addEducation - Adds a new education record to the person.
 * @method updateEducation - Updates an existing education record of the person.
 * @method removeEducation - Removes an education record from the person.
 * @method getSkillsText - Returns a formatted string of the person's skills.
 * @method getTechnologiesText - Returns a formatted string of the person's technologies.
 * @method getEducationText - Returns a formatted string of the person's education.
 * @method getSearchableContent - Returns combined searchable content for RAG functionality.
 */
export class Person {
  // Core person identity
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly birthDate: Date | null;
  readonly address: string | null;
  readonly city: string | null;
  readonly country: string | null;
  readonly notes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date | null;

  // Person capabilities - these belong to the person regardless of employment status
  public skills: PersonSkill[] = [];
  public technologies: PersonTechnology[] = [];
  public education: PersonEducation[] = [];

  constructor(data: PersonData) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.fullName = data.fullName;
    this.email = data.email;
    this.phone = data.phone ?? null;
    this.birthDate = data.birthDate ?? null;
    this.address = data.address ?? null;
    this.city = data.city ?? null;
    this.country = data.country ?? null;
    this.notes = data.notes ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt ?? null;
  }

  // Person-specific business methods
  get displayName(): string {
    return this.fullName || `${this.firstName} ${this.lastName}`;
  }

  // Skills management methods
  addSkill(skill: PersonSkill): void {
    const existingSkillIndex = this.skills.findIndex(s => s.skillId === skill.skillId);
    if (existingSkillIndex >= 0) {
      throw new Error(`Person already has skill: ${skill.skillName}`);
    }
    this.skills.push(skill);
  }

  updateSkill(skillId: string, updates: Partial<PersonSkill>): void {
    const skillIndex = this.skills.findIndex(s => s.skillId === skillId);
    if (skillIndex === -1) {
      throw new Error(`Skill not found: ${skillId}`);
    }
    this.skills[skillIndex] = { ...this.skills[skillIndex], ...updates };
  }

  removeSkill(skillId: string): void {
    const skillIndex = this.skills.findIndex(s => s.skillId === skillId);
    if (skillIndex === -1) {
      throw new Error(`Skill not found: ${skillId}`);
    }
    this.skills.splice(skillIndex, 1);
  }

  getSkillsByCategory(category: string): PersonSkill[] {
    return this.skills.filter(skill => skill.skillCategory === category);
  }

  // Technology management methods
  addTechnology(technology: PersonTechnology): void {
    const existingTechIndex = this.technologies.findIndex(t => t.technologyId === technology.technologyId);
    if (existingTechIndex >= 0) {
      throw new Error(`Person already has technology: ${technology.technologyName}`);
    }
    this.technologies.push(technology);
  }

  updateTechnology(technologyId: string, updates: Partial<PersonTechnology>): void {
    const techIndex = this.technologies.findIndex(t => t.technologyId === technologyId);
    if (techIndex === -1) {
      throw new Error(`Technology not found: ${technologyId}`);
    }
    this.technologies[techIndex] = { ...this.technologies[techIndex], ...updates };
  }

  removeTechnology(technologyId: string): void {
    const techIndex = this.technologies.findIndex(t => t.technologyId === technologyId);
    if (techIndex === -1) {
      throw new Error(`Technology not found: ${technologyId}`);
    }
    this.technologies.splice(techIndex, 1);
  }

  getTechnologiesByCategory(category: string): PersonTechnology[] {
    return this.technologies.filter(tech => tech.technologyCategory === category);
  }

  // Education management methods
  addEducation(education: PersonEducation): void {
    this.education.push(education);
  }

  updateEducation(educationId: string, updates: Partial<PersonEducation>): void {
    const eduIndex = this.education.findIndex(e => e.id === educationId);
    if (eduIndex === -1) {
      throw new Error(`Education record not found: ${educationId}`);
    }
    this.education[eduIndex] = { ...this.education[eduIndex], ...updates };
  }

  removeEducation(educationId: string): void {
    const eduIndex = this.education.findIndex(e => e.id === educationId);
    if (eduIndex === -1) {
      throw new Error(`Education record not found: ${educationId}`);
    }
    this.education.splice(eduIndex, 1);
  }

  // Utility methods for capabilities
  getSkillsText(): string {
    return this.skills.map(skill =>
      `${skill.skillName}${skill.proficiencyLevel ? ` (${skill.proficiencyLevel})` : ''}${skill.yearsOfExperience ? ` - ${skill.yearsOfExperience} years` : ''}`
    ).join(', ');
  }

  getTechnologiesText(): string {
    return this.technologies.map(tech =>
      `${tech.technologyName}${tech.proficiencyLevel ? ` (${tech.proficiencyLevel})` : ''}${tech.yearsOfExperience ? ` - ${tech.yearsOfExperience} years` : ''}`
    ).join(', ');
  }

  getEducationText(): string {
    return this.education.map(edu =>
      `${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Field'} from ${edu.institution}${edu.gpa ? ` (GPA: ${edu.gpa})` : ''}${edu.description ? ` - ${edu.description}` : ''}`
    ).join('; ');
  }

  // Combined searchable content for RAG functionality
  getSearchableContent(): string {
    const sections = [
      `Person: ${this.displayName}`,
      `Email: ${this.email}`,
      `Location: ${this.city || 'N/A'}${this.country ? `, ${this.country}` : ''}`,
      `Skills: ${this.getSkillsText()}`,
      `Technologies: ${this.getTechnologiesText()}`,
      `Education: ${this.getEducationText()}`,
      this.notes ? `Notes: ${this.notes}` : ''
    ].filter(section => section.trim().length > 0);

    return sections.join('\n');
  }
} 