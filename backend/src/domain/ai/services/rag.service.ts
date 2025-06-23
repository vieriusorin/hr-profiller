import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { OpenAIService } from './openai.service';
import { VectorDatabaseService } from './vector-database.service';
import { McpClientService } from '../../mcp/services/mcp-client.service';
import { PersonRepository } from '../../person/repositories/person.repository';
import { type SimilarityResult, type EmbeddingMetadata } from '../../../../db/schema/embeddings.schema';

export interface RAGAnalysisResult {
  analysis: string;
  similarPersons: SimilarityResult[];
  context: string;
  metadata: {
    queryTokens: number;
    analysisTokens: number;
    totalCost: string;
    executionTime: number;
  };
}

export interface RAGSearchResult {
  persons: SimilarityResult[];
  query: string;
  metadata: {
    queryTokens: number;
    searchTime: number;
  };
}

export interface PersonAnalysisContext {
  person: any;
  similarPersons: any[];
  skillsContext?: string;
}

export interface AnalysisRequest {
  personId: string;
  analysisType: 'capability_analysis' | 'skill_gap' | 'career_recommendation' | 'general';
  includeSimilarPersons?: boolean;
  includeSkillsContext?: boolean;
}

@injectable()
export class RAGService {
  constructor(
    @inject(TYPES.OpenAIService) private openaiService: OpenAIService,
    @inject(TYPES.VectorDatabaseService) private vectorDb: VectorDatabaseService,
    @inject(TYPES.McpClientService) private mcpService: McpClientService,
    @inject(TYPES.PersonRepository) private personRepository: PersonRepository
  ) {}

  /**
   * Main RAG analysis method - orchestrates the entire flow
   * This is the entry point for person analysis with AI
   */
  async analyzePersonWithRAG(request: AnalysisRequest): Promise<string> {
    try {
      console.log(`Starting RAG analysis for person ${request.personId} with type: ${request.analysisType}`);

      // Step 1: Get person data with all related information
      const person = await this.getPersonWithContext(request.personId);
      if (!person) {
        throw new Error('Person not found');
      }

      // Step 2: Generate or fetch embeddings for the person
      const embedding = await this.ensurePersonEmbedding(person);

      // Step 3: Find similar persons if requested
      let similarPersons: any[] = [];
      if (request.includeSimilarPersons !== false) {
        similarPersons = await this.findSimilarPersonsForAnalysis(embedding, person.id);
      }

      // Step 4: Get skills context if requested
      let skillsContext: string | undefined;
      if (request.includeSkillsContext) {
        skillsContext = await this.getSkillsContext(person);
      }

      // Step 5: Assemble the context for AI analysis
      const context: PersonAnalysisContext = {
        person,
        similarPersons,
        skillsContext
      };

      // Step 6: Call MCP server for AI analysis
      const analysisResult = await this.mcpService.analyzeData(
        JSON.stringify(context),
        request.analysisType
      );

      console.log(`RAG analysis completed for person ${request.personId}`);
      return analysisResult;

    } catch (error) {
      console.error('RAG analysis failed:', error);
      throw new Error(`RAG analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get person data with all related information (skills, technologies, education, etc.)
   */
  private async getPersonWithContext(personId: string): Promise<any> {
    return await this.personRepository.findById(personId, true);
  }

  /**
   * Ensure person has embeddings, generate if not exists
   */
  private async ensurePersonEmbedding(person: any): Promise<number[]> {
    try {
      // Check if embedding already exists
      const existingEmbedding = await this.vectorDb.getPersonEmbedding(person.id, 'profile');
      
      if (existingEmbedding) {
        console.log(`Using existing embedding for person ${person.id}`);
        return JSON.parse(existingEmbedding.embedding);
      }

      // Generate new embedding
      console.log(`Generating new embedding for person ${person.id}`);
      const personText = this.createPersonText(person);
      const embeddingResult = await this.openaiService.generateEmbeddings(personText);
      
      // Store the embedding
      await this.vectorDb.storePersonEmbedding(
        person.id,
        embeddingResult.embedding,
        personText,
        'profile',
        embeddingResult.model,
        {
          personName: `${person.firstName} ${person.lastName}`,
          email: person.email,
          skillsCount: person.skills?.length || 0,
          technologiesCount: person.technologies?.length || 0,
          educationCount: person.education?.length || 0,
          lastUpdated: new Date().toISOString(),
        }
      );

      return embeddingResult.embedding;

    } catch (error) {
      console.error('Error ensuring person embedding:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create text representation of person for embedding generation
   */
  private createPersonText(person: any): string {
    const parts = [
      `${person.firstName} ${person.lastName}`,
      person.email,
      person.skills?.map((s: any) => s.skillName).join(' ') || '',
      person.technologies?.map((t: any) => t.technologyName).join(' ') || '',
      person.education?.map((e: any) => `${e.degree} ${e.fieldOfStudy} ${e.institution}`).join(' ') || '',
      person.notes || ''
    ];

    return parts.filter(Boolean).join(' ');
  }

  /**
   * Find similar persons using vector similarity search (for analysis context)
   */
  private async findSimilarPersonsForAnalysis(embedding: number[], excludePersonId: string): Promise<any[]> {
    try {
      const similarResults = await this.vectorDb.findSimilarPersons(
        embedding,
        'profile',
        5, // Get top 5 similar persons
        0.7 // Minimum similarity threshold
      );

      // Filter out the person themselves and format results
      return similarResults
        .filter((result: any) => result.personId !== excludePersonId)
        .map((result: any) => ({
          personId: result.personId,
          personName: result.personName,
          similarity: Math.round(result.similarity * 100),
          skills: result.skills || [],
          position: result.position || ''
        }))
        .slice(0, 3); // Return top 3

    } catch (error) {
      console.error('Error finding similar persons:', error);
      return []; // Return empty array if similarity search fails
    }
  }

  /**
   * Get market context for person's skills
   */
  private async getSkillsContext(person: any): Promise<string> {
    try {
      const skills = person.skills?.map((s: any) => s.skillName) || [];
      const technologies = person.technologies?.map((t: any) => t.technologyName) || [];
      
      if (skills.length === 0 && technologies.length === 0) {
        return 'No skills or technologies found for market context analysis.';
      }

      // Create a simple market context based on skills
      const allSkills = [...skills, ...technologies];
      const skillList = allSkills.join(', ');
      
      return `Market Context: This professional has expertise in ${skillList}. These skills are in high demand in the current market, particularly in software development, data science, and technology consulting roles.`;

    } catch (error) {
      console.error('Error getting skills context:', error);
      return 'Unable to generate skills market context.';
    }
  }

  /**
   * Generate embeddings for all persons (batch operation)
   */
  async generateAllPersonEmbeddings(): Promise<void> {
    try {
      console.log('Starting batch embedding generation for all persons...');
      
      const persons = await this.personRepository.findAll(true);
      
      for (const person of persons) {
        try {
          await this.ensurePersonEmbedding(person);
          console.log(`Generated embedding for ${person.firstName} ${person.lastName}`);
        } catch (error) {
          console.error(`Failed to generate embedding for person ${person.id}:`, error);
        }
      }
      
      console.log('Batch embedding generation completed');
    } catch (error) {
      console.error('Batch embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Find similar persons using text query (for search functionality)
   */
  async findSimilarPersons(
    queryText: string,
    limit: number = 10,
    similarityThreshold: number = 0.7
  ): Promise<RAGSearchResult> {
    const startTime = Date.now();
    
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.openaiService.generateEmbeddings(queryText);
      
      // Find similar persons
      const similarResults = await this.vectorDb.findSimilarPersons(
        queryEmbedding.embedding,
        'profile',
        limit,
        similarityThreshold
      );

      // Enrich results with additional person data
      const enrichedResults = await this.enrichSimilarityResults(similarResults);

      const searchTime = Date.now() - startTime;

      return {
        persons: enrichedResults,
        query: queryText,
        metadata: {
          queryTokens: queryEmbedding.usage.totalTokens,
          searchTime,
        }
      };

    } catch (error) {
      console.error('Error in findSimilarPersons:', error);
      throw new Error(`Similarity search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate person embedding (for manual embedding generation)
   */
  async generatePersonEmbedding(personId: string, embeddingType: string = 'profile'): Promise<void> {
    try {
      const person = await this.personRepository.findById(personId, true);
      if (!person) {
        throw new Error('Person not found');
      }

      await this.ensurePersonEmbedding(person);
      console.log(`Generated ${embeddingType} embedding for person ${personId}`);

    } catch (error) {
      console.error('Error generating person embedding:', error);
      throw error;
    }
  }

  /**
   * Get RAG statistics
   */
  async getRAGStats(): Promise<{
    embeddings: any;
    searches: any;
    costs: any;
  }> {
    try {
      const embeddings = await this.vectorDb.getEmbeddingStats();
      
      return {
        embeddings,
        searches: {
          totalSearches: 0, // Will be implemented when search tracking is added
          averageSearchTime: 0,
        },
        costs: {
          totalEmbeddings: embeddings.totalCost,
          totalSearches: '0.0005',  // Sample cost
          totalCost: (parseFloat(embeddings.totalCost) + 0.0005).toString()
        }
      };

    } catch (error) {
      console.error('Error getting RAG stats:', error);
      throw error;
    }
  }

  /**
   * Enrich similarity results with additional person data
   */
  private async enrichSimilarityResults(results: SimilarityResult[]): Promise<SimilarityResult[]> {
    try {
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          try {
            const person = await this.personRepository.findById(result.personId, true);
            if (person) {
              return {
                ...result,
                personName: `${person.firstName} ${person.lastName}`,
                email: person.email,
                skills: person.skills?.map((s: any) => s.skillName) || [],
                technologies: person.technologies?.map((t: any) => t.technologyName) || []
              };
            }
            return result;
          } catch (error) {
            console.error(`Error enriching result for person ${result.personId}:`, error);
            return result;
          }
        })
      );

      return enrichedResults;

    } catch (error) {
      console.error('Error enriching similarity results:', error);
      return results; // Return original results if enrichment fails
    }
  }
} 