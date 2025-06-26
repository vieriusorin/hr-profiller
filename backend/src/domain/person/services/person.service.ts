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
  async analyzePersonCapabilitiesWithAI(
    personId: string, 
    analysisType: string = 'capability_analysis',
    userRole: string = 'hr_manager',
    urgency: string = 'standard'
  ): Promise<{
    analysis: string;
    metadata: any;
    confidence?: number;
  }> {
    try {
      const person = await this.personRepository.findById(personId, true);
      if (!person) {
        throw new Error('Person not found');
      }

      const result = await this.mcpClientService.analyzeData(
        JSON.stringify(person),
        analysisType,
        userRole,
        urgency,
        'internal'
      );

      return {
        analysis: result.data.analysis,
        metadata: result.data.metadata,
        confidence: result.data.confidence
      };

    } catch (error) {
      console.error('Failed to analyze person capabilities:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a comprehensive report for a person
   * Creates a formatted document suitable for sharing, including personal details, 
   * professional background, and achievements
   */
  async generatePersonReport(
    personId: string, 
    reportType: string = 'comprehensive',
    userRole: string = 'hr_manager',
    includeMetrics: boolean = true
  ): Promise<{
    report: string;
    metadata: any;
  }> {
    try {
      const person = await this.personRepository.findById(personId, true);
      if (!person) {
        throw new Error('Person not found');
      }

      const result = await this.mcpClientService.generateReport(
        JSON.stringify(person),
        reportType,
        userRole,
        includeMetrics,
        'internal'
      );

      return {
        report: result.data.analysis,
        metadata: result.data.metadata
      };

    } catch (error) {
      console.error('Failed to generate person report:', error);
      throw new Error(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform skill benchmarking for a person
   */
  async benchmarkPersonSkills(
    personId: string,
    industry?: string,
    region?: string,
    includeProjections: boolean = true
  ): Promise<{
    benchmarking: string;
    metadata: any;
  }> {
    try {
      const person = await this.personRepository.findById(personId, true);
      if (!person) {
        throw new Error('Person not found');
      }

      const result = await this.mcpClientService.skillBenchmarking(
        JSON.stringify(person),
        industry,
        region,
        includeProjections
      );

      return {
        benchmarking: result.data.analysis,
        metadata: result.data.metadata
      };

    } catch (error) {
      console.error('Failed to benchmark person skills:', error);
      throw new Error(`Skill benchmarking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform compensation analysis for a person
   */
  async analyzePersonCompensation(
    personId: string,
    marketScope: string = 'national',
    includeEquityAnalysis: boolean = true
  ): Promise<{
    analysis: string;
    metadata: any;
  }> {
    try {
      const person = await this.personRepository.findById(personId, true);
      if (!person) {
        throw new Error('Person not found');
      }

      // Clean the person object to avoid JSON serialization issues
      const cleanPerson = JSON.parse(JSON.stringify(person, (key, value) => {
        // Handle Date objects
        if (value instanceof Date) {
          return value.toISOString();
        }
        // Handle circular references and undefined values
        if (typeof value === 'undefined') {
          return null;
        }
        return value;
      }));

      const result = await this.mcpClientService.compensationAnalysis(
        JSON.stringify(cleanPerson),
        marketScope,
        includeEquityAnalysis
      );

      return {
        analysis: result.data.analysis,
        metadata: result.data.metadata
      };

    } catch (error) {
      console.error('Failed to analyze person compensation:', error);
      throw new Error(`Compensation analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper method to calculate data completeness score
   */
  private calculateDataCompleteness(person: Person): number {
    let score = 0;
    const factors = [
      { field: 'email', weight: 10, present: !!person.email },
      { field: 'phone', weight: 5, present: !!person.phone },
      { field: 'address', weight: 5, present: !!person.address },
      { field: 'skills', weight: 25, present: person.skills.length > 0 },
      { field: 'technologies', weight: 20, present: person.technologies.length > 0 },
      { field: 'education', weight: 15, present: person.education.length > 0 },
      { field: 'position', weight: 10, present: !!(person as any).position },
      { field: 'department', weight: 5, present: !!(person as any).department },
      { field: 'workHistory', weight: 5, present: !!(person as any).workHistory?.length }
    ];

    factors.forEach(factor => {
      if (factor.present) score += factor.weight;
    });

    return score;
  }

  /**
   * Helper method to calculate total years of experience
   */
  private calculateTotalExperience(person: Person): number {
    const skillsExperience = person.skills.reduce((max, skill) => {
      const years = skill.yearsOfExperience ? parseInt(skill.yearsOfExperience, 10) : 0;
      return Math.max(max, isNaN(years) ? 0 : years);
    }, 0);
    const techExperience = person.technologies.reduce((max, tech) => {
      const years = tech.yearsOfExperience ? parseInt(tech.yearsOfExperience, 10) : 0;
      return Math.max(max, isNaN(years) ? 0 : years);
    }, 0);
    
    return Math.max(skillsExperience, techExperience);
  }
} 