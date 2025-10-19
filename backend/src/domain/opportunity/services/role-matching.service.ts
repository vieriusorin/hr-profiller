import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { PersonRepository } from '../../person/repositories/person.repository';
import { RoleRepository } from '../repositories/role.repository';
import { RAGService } from '../../ai/services/rag.service';
import { OpenAIService } from '../../ai/services/openai.service';

/**
 * Match result for a person-role pair
 */
export interface RoleMatch {
  personId: string;
  personName: string;
  roleId: string;
  roleName: string;
  matchScore: number; // 0-100
  matchReason: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  confidence: number; // 0-1
}

/**
 * Request for role matching
 */
export interface RoleMatchingRequest {
  roleId?: string; // If provided, match this specific role
  opportunityId?: string; // If provided, match all roles in this opportunity
  personIds?: string[]; // If provided, match only these persons
  minMatchScore?: number; // Minimum match score to return (0-100)
  limit?: number; // Max number of matches to return per role
}

/**
 * Response for role matching
 */
export interface RoleMatchingResponse {
  matches: RoleMatch[];
  metadata: {
    totalPersonsAnalyzed: number;
    totalRolesAnalyzed: number;
    averageMatchScore: number;
    processingTime: number;
    timestamp: string;
  };
}

/**
 * Role Matching Service
 * 
 * This service implements AI-powered matching of people to opportunity roles.
 * It uses RAG and OpenAI to analyze person profiles against role requirements
 * and provides intelligent match scores and recommendations.
 */
@injectable()
export class RoleMatchingService {
  // Simple in-memory cache for role matching results
  private matchCache = new Map<string, { result: RoleMatch; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @inject(TYPES.PersonRepository)
    private readonly personRepository: PersonRepository,
    @inject(TYPES.RoleRepository)
    private readonly roleRepository: RoleRepository,
    @inject(TYPES.OpenAIService)
    private readonly openaiService: OpenAIService,
    @inject(TYPES.RAGService)
    private readonly ragService: RAGService
  ) { }

  /**
   * Find best matches for roles
   * Main entry point for role matching functionality
   */
  async findMatches(request: RoleMatchingRequest): Promise<RoleMatchingResponse> {
    const startTime = Date.now();

    try {
      // Get roles to match
      const roles = await this.getRolesToMatch(request);

      if (roles.length === 0) {
        return this.createEmptyResponse(startTime);
      }

      // Get persons to consider
      const persons = await this.getPersonsToMatch(request);

      if (persons.length === 0) {
        return this.createEmptyResponse(startTime);
      }

      // Perform matching for each role
      const allMatches: RoleMatch[] = [];

      for (const role of roles) {
        const roleMatches = await this.matchPersonsToRole(role, persons);
        allMatches.push(...roleMatches);
      }

      // Filter by minimum match score
      const minScore = request.minMatchScore || 0;
      const filteredMatches = allMatches.filter(m => m.matchScore >= minScore);

      // Sort by match score (highest first)
      filteredMatches.sort((a, b) => b.matchScore - a.matchScore);

      // Apply limit if specified
      const limit = request.limit || filteredMatches.length;
      const finalMatches = filteredMatches.slice(0, limit);

      // Calculate metadata
      const processingTime = Date.now() - startTime;
      const averageMatchScore = finalMatches.length > 0
        ? finalMatches.reduce((sum, m) => sum + m.matchScore, 0) / finalMatches.length
        : 0;

      return {
        matches: finalMatches,
        metadata: {
          totalPersonsAnalyzed: persons.length,
          totalRolesAnalyzed: roles.length,
          averageMatchScore: Math.round(averageMatchScore * 100) / 100,
          processingTime,
          timestamp: new Date().toISOString(),
        },
      };

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Role matching failed:', error);
      throw new Error(`Role matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Match a single person to a single role
   */
  async matchPersonToRole(personId: string, roleId: string): Promise<RoleMatch> {
    const cacheKey = `${personId}-${roleId}`;

    try {
      // Check cache first
      const cached = this.matchCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        // eslint-disable-next-line no-console
        console.log(`Cache hit for ${cacheKey}`);
        return cached.result;
      }

      const person = await this.personRepository.findById(personId, true);
      if (!person) {
        throw new Error(`Person not found: ${personId}`);
      }

      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new Error(`Role not found: ${roleId}`);
      }

      const match = await this.analyzeMatch(person, role);

      // Cache the result
      this.matchCache.set(cacheKey, { result: match, timestamp: Date.now() });

      // Clean up old cache entries
      this.cleanupCache();

      return match;

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Person-to-role matching failed:', error);
      throw new Error(`Matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get top N candidates for a specific role
   */
  async getTopCandidatesForRole(roleId: string, limit: number = 10): Promise<RoleMatch[]> {
    const result = await this.findMatches({
      roleId,
      limit,
      minMatchScore: 50, // Only return matches with at least 50% score
    });

    return result.matches;
  }

  /**
   * Get all role matches for a specific person
   */
  async getRolesForPerson(personId: string, opportunityId?: string): Promise<RoleMatch[]> {
    const result = await this.findMatches({
      opportunityId,
      personIds: [personId],
    });

    return result.matches;
  }

  // Private helper methods

  /**
   * Get roles to match based on request
   */
  private async getRolesToMatch(request: RoleMatchingRequest): Promise<any[]> {
    if (request.roleId) {
      const role = await this.roleRepository.findById(request.roleId);
      return role ? [role] : [];
    }

    if (request.opportunityId) {
      return await this.roleRepository.findAllByOpportunity(request.opportunityId);
    }

    // If no specific role or opportunity, return empty
    // (we don't want to match against all roles in the system)
    return [];
  }

  /**
   * Get persons to match based on request
   */
  private async getPersonsToMatch(request: RoleMatchingRequest): Promise<any[]> {
    if (request.personIds && request.personIds.length > 0) {
      const persons = await Promise.all(
        request.personIds.map(id => this.personRepository.findById(id, true))
      );
      return persons.filter(p => p !== null);
    }

    // Get all persons with their capabilities
    return await this.personRepository.findAll(true);
  }

  /**
   * Match multiple persons to a single role
   */
  private async matchPersonsToRole(role: any, persons: any[]): Promise<RoleMatch[]> {
    const matches: RoleMatch[] = [];

    for (const person of persons) {
      try {
        const match = await this.analyzeMatch(person, role);
        matches.push(match);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to match person ${person.id} to role ${role.id}:`, error);
        // Continue with other persons
      }
    }

    return matches;
  }

  /**
   * Analyze match between a person and a role using AI
   */
  private async analyzeMatch(person: any, role: any): Promise<RoleMatch> {
    try {
      // Prepare context for AI analysis
      const matchContext = this.prepareMatchContext(person, role);

      // Use OpenAI to analyze the match with optimized prompt
      const analysisPrompt = this.createOptimizedMatchAnalysisPrompt(matchContext);

      const aiResult = await this.openaiService.generateChatCompletion([
        { role: 'system', content: 'You are an expert HR analyst. Respond with valid JSON only.' },
        { role: 'user', content: analysisPrompt }
      ], 0.2); // Lower temperature for faster responses

      // Parse AI response
      let analysis;
      try {
        // Extract JSON from response (in case there's additional text)
        const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : aiResult.content;
        analysis = JSON.parse(jsonStr);
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse AI response:', parseError);
        throw parseError;
      }

      // Create match result
      return {
        personId: person.id,
        personName: `${person.firstName} ${person.lastName}`,
        roleId: role.id,
        roleName: role.roleName,
        matchScore: this.validateScore(analysis.matchScore),
        matchReason: analysis.matchReason || 'AI analysis completed',
        strengths: analysis.strengths || [],
        gaps: analysis.gaps || [],
        recommendations: analysis.recommendations || [],
        confidence: this.validateConfidence(analysis.confidence),
      };

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('AI match analysis failed, using fallback:', error);

      // Fallback to basic scoring if AI fails
      return this.fallbackMatch(person, role);
    }
  }

  /**
   * Prepare context for match analysis
   */
  private prepareMatchContext(person: any, role: any): any {
    return {
      person: {
        name: `${person.firstName} ${person.lastName}`,
        email: person.email,
        skills: person.skills?.map((s: any) => ({
          name: s.skillName,
          proficiency: s.proficiencyLevel,
          yearsOfExperience: s.yearsOfExperience,
        })) || [],
        technologies: person.technologies?.map((t: any) => ({
          name: t.technologyName,
          proficiency: t.proficiencyLevel,
          yearsOfExperience: t.yearsOfExperience,
        })) || [],
        education: person.education?.map((e: any) => ({
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          institution: e.institution,
        })) || [],
      },
      role: {
        name: role.roleName,
        jobGrade: role.jobGrade,
        level: role.level,
        allocation: role.allocation,
        notes: role.notes,
        status: role.status,
      },
    };
  }

  /**
   * Create optimized AI prompt for faster analysis
   */
  private createOptimizedMatchAnalysisPrompt(context: any): string {
    return `Analyze candidate-role match. Respond with JSON only.

CANDIDATE: ${context.person.name}
Skills: ${context.person.skills?.slice(0, 5).map((s: any) => s.name).join(', ') || 'None'}
Tech: ${context.person.technologies?.slice(0, 3).map((t: any) => t.name).join(', ') || 'None'}

ROLE: ${context.role.name}
Required: ${context.role.requiredSkills?.slice(0, 5).join(', ') || 'None'}

JSON: {"matchScore": 0-100, "matchReason": "brief reason", "strengths": ["s1"], "gaps": ["g1"], "recommendations": ["r1"], "confidence": 0-100}`;
  }

  /**
   * Create AI prompt for match analysis
   */
  private createMatchAnalysisPrompt(context: any): string {
    return `You are an expert HR analyst specialized in matching candidates to job roles.

Analyze the following person profile against the role requirements and provide a detailed match assessment.

PERSON PROFILE:
Name: ${context.person.name}
Email: ${context.person.email}

Skills:
${context.person.skills.map((s: any) => `- ${s.name} (${s.proficiency || 'N/A'}, ${s.yearsOfExperience || 'N/A'} years)`).join('\n') || 'No skills listed'}

Technologies:
${context.person.technologies.map((t: any) => `- ${t.name} (${t.proficiency || 'N/A'}, ${t.yearsOfExperience || 'N/A'} years)`).join('\n') || 'No technologies listed'}

Education:
${context.person.education.map((e: any) => `- ${e.degree || 'N/A'} in ${e.fieldOfStudy || 'N/A'} from ${e.institution || 'N/A'}`).join('\n') || 'No education listed'}

ROLE REQUIREMENTS:
Role Name: ${context.role.name}
Job Grade: ${context.role.jobGrade || 'Not specified'}
Level: ${context.role.level || 'Not specified'}
Allocation: ${context.role.allocation || 'Not specified'}%
Additional Notes: ${context.role.notes || 'None'}

INSTRUCTIONS:
Provide a comprehensive match analysis in JSON format with the following structure:
{
  "matchScore": <number 0-100>,
  "matchReason": "<brief explanation of the overall match>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "gaps": ["<gap 1>", "<gap 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "confidence": <number 0-1>
}

Scoring guidelines:
- 90-100: Excellent match, candidate exceeds requirements
- 75-89: Strong match, candidate meets most requirements
- 60-74: Good match, candidate meets core requirements
- 40-59: Moderate match, some gaps but potential
- 0-39: Poor match, significant gaps

Ensure your response is valid JSON only, no additional text.`;
  }

  /**
   * Fallback match calculation if AI fails - improved logic
   */
  private fallbackMatch(person: any, role: any): RoleMatch {
    // Enhanced keyword-based matching as fallback
    const personSkills = person.skills?.map((s: any) => s.skillName?.toLowerCase() || '') || [];
    const personTechs = person.technologies?.map((t: any) => t.technologyName?.toLowerCase() || '') || [];
    const personEducation = person.education?.map((e: any) => e.fieldOfStudy?.toLowerCase() || '') || [];

    const roleKeywords = [
      role.roleName?.toLowerCase(),
      role.description?.toLowerCase(),
      ...(role.notes || '').toLowerCase().split(/\s+/).filter((word: string) => word.length > 3),
    ].filter(Boolean);

    // Calculate matches across different categories
    const skillMatches = roleKeywords.filter((keyword: string) =>
      personSkills.some((skill: string) => skill.includes(keyword) || keyword.includes(skill))
    );

    const techMatches = roleKeywords.filter((keyword: string) =>
      personTechs.some((tech: string) => tech.includes(keyword) || keyword.includes(tech))
    );

    const educationMatches = roleKeywords.filter((keyword: string) =>
      personEducation.some((edu: string) => edu.includes(keyword) || keyword.includes(edu))
    );

    const totalMatches = skillMatches.length + techMatches.length + educationMatches.length;
    const matchScore = Math.min(100, (totalMatches / Math.max(roleKeywords.length, 1)) * 100);

    // Generate meaningful strengths and gaps
    const strengths = [
      ...personSkills.slice(0, 3),
      ...personTechs.slice(0, 2)
    ].filter(Boolean);

    const gaps = roleKeywords
      .filter(keyword => !skillMatches.includes(keyword) && !techMatches.includes(keyword))
      .slice(0, 3);

    return {
      personId: person.id,
      personName: `${person.firstName} ${person.lastName}`,
      roleId: role.id,
      roleName: role.roleName,
      matchScore: Math.round(matchScore),
      matchReason: `Basic analysis: ${totalMatches} matches found in ${roleKeywords.length} requirements`,
      strengths: strengths.length > 0 ? strengths : ['Skills analysis unavailable'],
      gaps: gaps.length > 0 ? gaps : ['Gap analysis unavailable'],
      recommendations: ['Consider AI analysis for detailed insights'],
      confidence: 0.6,
    };
  }

  /**
   * Validate and clamp match score
   */
  private validateScore(score: any): number {
    const numScore = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(numScore)) return 0;
    return Math.max(0, Math.min(100, Math.round(numScore)));
  }

  /**
   * Validate and clamp confidence
   */
  private validateConfidence(confidence: any): number {
    const numConf = typeof confidence === 'number' ? confidence : parseFloat(confidence);
    if (isNaN(numConf)) return 0.5;
    return Math.max(0, Math.min(1, numConf));
  }

  /**
   * Create empty response
   */
  private createEmptyResponse(startTime: number): RoleMatchingResponse {
    return {
      matches: [],
      metadata: {
        totalPersonsAnalyzed: 0,
        totalRolesAnalyzed: 0,
        averageMatchScore: 0,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.matchCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.matchCache.delete(key);
      }
    }
  }
}

