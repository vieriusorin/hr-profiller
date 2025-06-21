import { Person } from '../entities/person.entity';
import { TypeNewPerson, TypePerson } from '../../../../db/schema/people.schema';

// Types for managing person capabilities
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

export type CreatePersonTechnologyData = {
  technologyName: string;
  proficiencyLevel?: string;
  yearsOfExperience?: string;
  lastUsed?: Date;
  context?: string;
  projectName?: string;
  description?: string;
};

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