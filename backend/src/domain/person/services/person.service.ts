import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { PersonRepository, CreatePersonSkillData, CreatePersonTechnologyData, CreatePersonEducationData } from '../repositories/person.repository';
import { Person } from '../entities/person.entity';
import { TypeNewPerson, TypePerson } from '../../../../db/schema/people.schema';

@injectable()
export class PersonService {
  constructor(
    @inject(TYPES.PersonRepository)
    private readonly personRepository: PersonRepository
  ) { }

  // Core person operations
  async getAllPersons(includeCapabilities: boolean = true): Promise<Person[]> {
    return this.personRepository.findAll(includeCapabilities);
  }

  async getPersonById(id: string, includeCapabilities: boolean = true): Promise<Person | null> {
    return this.personRepository.findById(id, includeCapabilities);
  }

  async getPersonByEmail(email: string, includeCapabilities: boolean = true): Promise<Person | null> {
    return this.personRepository.findByEmail(email, includeCapabilities);
  }

  async createPerson(personData: TypeNewPerson): Promise<Person> {
    return this.personRepository.create(personData);
  }

  async updatePerson(id: string, personData: Partial<TypePerson>): Promise<Person> {
    const existingPerson = await this.personRepository.findById(id);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    return this.personRepository.update(id, personData);
  }

  async deletePerson(id: string): Promise<void> {
    const existingPerson = await this.personRepository.findById(id);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    return this.personRepository.delete(id);
  }

  // Skills management - person-centric business logic
  async addSkillToPerson(personId: string, skillData: CreatePersonSkillData): Promise<void> {
    const existingPerson = await this.personRepository.findById(personId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    // Business rule: Check if person already has this skill
    const existingSkill = existingPerson.skills.find(s =>
      s.skillName.toLowerCase() === skillData.skillName.toLowerCase()
    );

    if (existingSkill) {
      throw new Error(`Person already has skill: ${skillData.skillName}. Use update instead.`);
    }

    return this.personRepository.addSkillToPerson(personId, skillData);
  }

  async updatePersonSkill(personId: string, skillIdentifier: string, skillData: Partial<CreatePersonSkillData>): Promise<void> {
    const existingPerson = await this.personRepository.findById(personId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    return this.personRepository.updatePersonSkill(personId, skillIdentifier, skillData);
  }

  async removeSkillFromPerson(personId: string, skillIdentifier: string): Promise<void> {
    const existingPerson = await this.personRepository.findById(personId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    return this.personRepository.removeSkillFromPerson(personId, skillIdentifier);
  }

  // Technologies management - person-centric business logic
  async addTechnologyToPerson(personId: string, technologyData: CreatePersonTechnologyData): Promise<void> {
    const existingPerson = await this.personRepository.findById(personId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    // Business rule: Check if person already has this technology
    const existingTechnology = existingPerson.technologies.find(t =>
      t.technologyName.toLowerCase() === technologyData.technologyName.toLowerCase()
    );

    if (existingTechnology) {
      throw new Error(`Person already has technology: ${technologyData.technologyName}. Use update instead.`);
    }

    return this.personRepository.addTechnologyToPerson(personId, technologyData);
  }

  async updatePersonTechnology(personId: string, technologyIdentifier: string, technologyData: Partial<CreatePersonTechnologyData>): Promise<void> {
    const existingPerson = await this.personRepository.findById(personId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    return this.personRepository.updatePersonTechnology(personId, technologyIdentifier, technologyData);
  }

  async removeTechnologyFromPerson(personId: string, technologyIdentifier: string): Promise<void> {
    const existingPerson = await this.personRepository.findById(personId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    return this.personRepository.removeTechnologyFromPerson(personId, technologyIdentifier);
  }

  // Education management - person-centric business logic
  async addEducationToPerson(personId: string, educationData: CreatePersonEducationData): Promise<string> {
    const existingPerson = await this.personRepository.findById(personId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    // Business rule: Validate education dates
    if (educationData.startDate && educationData.graduationDate) {
      if (educationData.startDate > educationData.graduationDate) {
        throw new Error('Start date cannot be after graduation date');
      }
    }

    return this.personRepository.addEducationToPerson(personId, educationData);
  }

  async updatePersonEducation(personId: string, educationIdentifier: string, educationData: Partial<CreatePersonEducationData>): Promise<void> {
    const existingPerson = await this.personRepository.findById(personId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    // Business rule: Validate education dates if provided
    if (educationData.startDate && educationData.graduationDate) {
      if (educationData.startDate > educationData.graduationDate) {
        throw new Error('Start date cannot be after graduation date');
      }
    }

    return this.personRepository.updatePersonEducation(personId, educationIdentifier, educationData);
  }

  async removeEducationFromPerson(personId: string, educationIdentifier: string): Promise<void> {
    const existingPerson = await this.personRepository.findById(personId);
    if (!existingPerson) {
      throw new Error('Person not found');
    }

    return this.personRepository.removeEducationFromPerson(personId, educationIdentifier);
  }

  // Search methods - person-focused
  async searchPersonsBySkills(skillNames: string[]): Promise<Person[]> {
    if (!skillNames || skillNames.length === 0) {
      throw new Error('At least one skill name is required for search');
    }

    return this.personRepository.searchPersonsBySkills(skillNames);
  }

  async searchPersonsByTechnologies(technologyNames: string[]): Promise<Person[]> {
    if (!technologyNames || technologyNames.length === 0) {
      throw new Error('At least one technology name is required for search');
    }

    return this.personRepository.searchPersonsByTechnologies(technologyNames);
  }

  async searchPersonsByEducation(institution?: string, degree?: string, fieldOfStudy?: string): Promise<Person[]> {
    if (!institution && !degree && !fieldOfStudy) {
      throw new Error('At least one education criteria is required for search');
    }

    return this.personRepository.searchPersonsByEducation(institution, degree, fieldOfStudy);
  }

  async searchPersonsByText(searchText: string): Promise<Person[]> {
    if (!searchText || searchText.trim().length === 0) {
      throw new Error('Search text is required');
    }

    return this.personRepository.searchPersonsByText(searchText.trim());
  }

  // Business logic for person capabilities analysis
  async getPersonCapabilitiesSummary(personId: string): Promise<{
    skillsCount: number;
    technologiesCount: number;
    educationCount: number;
    topSkillCategories: string[];
    topTechnologyCategories: string[];
  }> {
    const person = await this.personRepository.findById(personId, true);
    if (!person) {
      throw new Error('Person not found');
    }

    const skillCategories = person.skills
      .map(s => s.skillCategory)
      .filter(c => c)
      .reduce((acc, category) => {
        acc[category!] = (acc[category!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const technologyCategories = person.technologies
      .map(t => t.technologyCategory)
      .filter(c => c)
      .reduce((acc, category) => {
        acc[category!] = (acc[category!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      skillsCount: person.skills.length,
      technologiesCount: person.technologies.length,
      educationCount: person.education.length,
      topSkillCategories: Object.keys(skillCategories)
        .sort((a, b) => skillCategories[b] - skillCategories[a])
        .slice(0, 5),
      topTechnologyCategories: Object.keys(technologyCategories)
        .sort((a, b) => technologyCategories[b] - technologyCategories[a])
        .slice(0, 5),
    };
  }
} 