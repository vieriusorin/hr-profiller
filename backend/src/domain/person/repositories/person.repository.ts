import { Person } from '../entities/person.entity';
import { TypeNewPerson, TypePerson } from '../../../../db/schema/people.schema';

// Types for managing person capabilities
/**
 * @description Data structure for creating a new Person Skill record.
 * @interface CreatePersonSkillData
 * @property skillName - Name of the skill.
 * @property proficiencyLevel - Proficiency level in the skill.
 * @property yearsOfExperience - Years of experience with the skill.
 * @property lastUsed - Date when the skill was last used.
 * @property isCertified - Whether the skill is certified.
 * @property certificationName - Name of the certification.
 * @property certificationDate - Date of the certification.
 * @property notes - Additional notes about the skill.
 */
export type CreatePersonSkillData = {
  skillName: string;
  proficiencyLevel?: string;
  yearsOfExperience?: string;
  lastUsed?: Date;
  isCertified?: boolean;
  certificationName?: string;
  certificationDate?: Date;
  notes?: string;
};

/**
 * @description Data structure for creating a new Person Technology record.
 * @interface CreatePersonTechnologyData
 * @property technologyName - Name of the technology.
 * @property proficiencyLevel - Proficiency level in the technology.
 * @property yearsOfExperience - Years of experience with the technology.
 * @property lastUsed - Date when the technology was last used.
 * @property context - Context in which the technology was used.
 * @property projectName - Name of the project where the technology was used.
 * @property description - Description of the technology usage.
 */
export type CreatePersonTechnologyData = {
  technologyName: string;
  proficiencyLevel?: string;
  yearsOfExperience?: string;
  lastUsed?: Date;
  context?: string;
  projectName?: string;
  description?: string;
};

/**
 * @description Data structure for creating a new Person Education record.
 * @interface CreatePersonEducationData
 * @property institution - Name of the educational institution.
 * @property degree - Degree obtained.
 * @property fieldOfStudy - Field of study.
 * @property startDate - Start date of the education.
 * @property graduationDate - Graduation date.
 * @property description - Description of the education.
 * @property gpa - Grade Point Average.
 * @property isCurrentlyEnrolled - Whether the person is currently enrolled.
 */
export type CreatePersonEducationData = {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  graduationDate?: Date;
  description?: string;
  gpa?: string;
  isCurrentlyEnrolled?: string;
};

/**
 * @description Repository interface for Person entity.
 * Defines methods for CRUD operations and person-centric capability management.
 * @interface PersonRepository
 * @method findAll - Retrieve all person records.
 * @method findById - Retrieve a person record by its ID.
 * @method findByEmail - Retrieve a person record by email.
 * @method create - Create a new person record.
 * @method update - Update an existing person record.
 * @method delete - Delete a person record by its ID.
 * @method addSkillToPerson - Add a skill to a person.
 * @method updatePersonSkill - Update a person's skill.
 * @method removeSkillFromPerson - Remove a skill from a person.
 * @method addTechnologyToPerson - Add a technology to a person.
 * @method updatePersonTechnology - Update a person's technology.
 * @method removeTechnologyFromPerson - Remove a technology from a person.
 * @method addEducationToPerson - Add an education record to a person.
 * @method updatePersonEducation - Update a person's education record.
 * @method removeEducationFromPerson - Remove an education record from a person.
 * @method searchPersonsBySkills - Search persons by skill names.
 * @method searchPersonsByTechnologies - Search persons by technology names.
 * @method searchPersonsByEducation - Search persons by education details.
 * @method searchPersonsByText - General text search for persons.
 */
export interface PersonRepository {
  // Core CRUD operations for Person
  findAll(includeCapabilities?: boolean): Promise<Person[]>;
  findById(id: string, includeCapabilities?: boolean): Promise<Person | null>;
  findByEmail(email: string, includeCapabilities?: boolean): Promise<Person | null>;
  create(personData: TypeNewPerson): Promise<Person>;
  update(id: string, personData: Partial<TypePerson>): Promise<Person>;
  delete(id: string): Promise<void>;

  // Skills management - person-centric
  addSkillToPerson(personId: string, skillData: CreatePersonSkillData): Promise<void>;
  updatePersonSkill(personId: string, skillIdentifier: string, skillData: Partial<CreatePersonSkillData>): Promise<void>;
  removeSkillFromPerson(personId: string, skillIdentifier: string): Promise<void>;

  // Technologies management - person-centric
  addTechnologyToPerson(personId: string, technologyData: CreatePersonTechnologyData): Promise<void>;
  updatePersonTechnology(personId: string, technologyIdentifier: string, technologyData: Partial<CreatePersonTechnologyData>): Promise<void>;
  removeTechnologyFromPerson(personId: string, technologyIdentifier: string): Promise<void>;

  // Education management - person-centric
  addEducationToPerson(personId: string, educationData: CreatePersonEducationData): Promise<string>;
  updatePersonEducation(personId: string, educationIdentifier: string, educationData: Partial<CreatePersonEducationData>): Promise<void>;
  removeEducationFromPerson(personId: string, educationIdentifier: string): Promise<void>;

  // Search methods for capabilities - person-focused
  searchPersonsBySkills(skillNames: string[]): Promise<Person[]>;
  searchPersonsByTechnologies(technologyNames: string[]): Promise<Person[]>;
  searchPersonsByEducation(institution?: string, degree?: string, fieldOfStudy?: string): Promise<Person[]>;

  // General search for RAG functionality
  searchPersonsByText(searchText: string): Promise<Person[]>;
} 