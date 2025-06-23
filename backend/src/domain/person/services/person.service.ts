import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { PersonRepository, CreatePersonSkillData, CreatePersonTechnologyData, CreatePersonEducationData } from '../repositories/person.repository';
import { Person } from '../entities/person.entity';
import { TypeNewPerson, TypePerson } from '../../../../db/schema/people.schema';
import { McpClientService } from '../../mcp/services/mcp-client.service';

@injectable()
export class PersonService {
  constructor(
    @inject(TYPES.PersonRepository)
    private readonly personRepository: PersonRepository,
    @inject(TYPES.McpClientService)
    private readonly mcpClientService: McpClientService
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

    const skillsCount = person.skills.length;
    const technologiesCount = person.technologies.length;
    const educationCount = person.education.length;

    // Extract unique categories and filter out null/undefined values
    const skillCategories = [...new Set(person.skills.map(s => s.skillCategory).filter(Boolean))] as string[];
    const technologyCategories = [...new Set(person.technologies.map(t => t.technologyCategory).filter(Boolean))] as string[];

    return {
      skillsCount,
      technologiesCount,
      educationCount,
      topSkillCategories: skillCategories,
      topTechnologyCategories: technologyCategories
    };
  }

  /**
   * Analyze person capabilities using MCP AI tools
   * Provides AI-powered insights about skills, potential growth areas, and career development opportunities
   */
  async analyzePersonCapabilitiesWithAI(personId: string, analysisType?: string): Promise<string> {
    try {
      const person = await this.personRepository.findById(personId, true);
      if (!person) {
        throw new Error('Person not found');
      }

      // Prepare data focusing on professional capabilities
      const personData = {
        skills: person.skills || [],
        technologies: person.technologies || [],
        education: person.education || [],
        capabilitiesSummary: await this.getPersonCapabilitiesSummary(personId),
        // Include minimal personal info needed for analysis
        firstName: person.firstName,
        lastName: person.lastName
      };

      // Use MCP service to analyze capabilities and provide insights
      const analysisResult = await this.mcpClientService.analyzeData(
        JSON.stringify(personData),
        analysisType || 'capability_analysis'
      );

      return analysisResult;
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate a comprehensive report for a person
   * Creates a formatted document suitable for sharing, including personal details, 
   * professional background, and achievements
   */
  async generatePersonReport(personId: string, reportType: string = 'comprehensive'): Promise<string> {
    try {
      const person = await this.personRepository.findById(personId, true);
      if (!person) {
        throw new Error('Person not found');
      }

      // Get capabilities summary for the report
      const capabilitiesSummary = await this.getPersonCapabilitiesSummary(personId);

      // Format the data for a comprehensive report
      const reportData = {
        personalInfo: {
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          phone: person.phone,
          birthDate: person.birthDate,
          address: person.address,
          city: person.city,
          country: person.country
        },
        professionalSummary: {
          skills: person.skills || [],
          technologies: person.technologies || [],
          education: person.education || [],
          capabilitiesSummary
        },
        reportMetadata: {
          generatedAt: new Date().toISOString(),
          reportType,
          version: '1.0'
        }
      };

      // Use MCP service to generate a formatted report
      const reportResult = await this.mcpClientService.generateReport(
        reportType,
        reportData
      );

      return reportResult;
    } catch (error: any) {
      console.error('Report generation failed:', error);
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }
} 