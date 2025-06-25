import 'dotenv/config';
import { injectable } from 'inversify';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, embed, embedMany, cosineSimilarity } from 'ai';

import { systemPrompts } from '../prompts/system-prompts';
import { analysisTemplates } from '../prompts/analysis-templates';
import { reportSpecifications, reportTypes, contextTemplate, peerComparisonTemplate, marketContextTemplate, marketIntelligenceTemplate } from '../prompts/report-templates';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface OpenAIService {
  generateCompletion(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    content: string;
    tokensUsed: number;
    model: string;
  }>;
}

@injectable()
export class OpenAIServiceImpl implements OpenAIService {
  private provider: ReturnType<typeof createOpenAI>;
  private embeddingModel: string;
  private chatModel: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    // Initialize AI SDK provider
    this.provider = createOpenAI({
      apiKey,
      compatibility: 'strict',
    });

    this.embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    this.chatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
  }

  async generateCompletion(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    content: string;
    tokensUsed: number;
    model: string;
  }> {
    try {
      const { text, usage } = await generateText({
        model: this.provider(options?.model || this.chatModel),
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 4000,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(60000), // 60 second timeout
      });

      return {
        content: text,
        tokensUsed: usage.totalTokens,
        model: options?.model || this.chatModel
      };
    } catch (error: any) {
      console.error('Error generating completion with AI SDK:', error);
      throw new Error(`Failed to generate completion: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for text using AI SDK
   * @param text - The input text to generate embeddings for
   * @returns Promise resolving to an EmbeddingResult containing the embedding vector and usage information
   */
  async generateEmbeddings(text: string): Promise<EmbeddingResult> {
    try {
      const { embedding, usage } = await embed({
        model: this.provider.embedding(this.embeddingModel),
        value: text,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(30000), // 30 second timeout for single embedding
      });

      return {
        embedding,
        model: this.embeddingModel,
        usage: {
          promptTokens: usage.tokens,
          totalTokens: usage.tokens,
        },
      };
    } catch (error: any) {
      console.error('Error generating embeddings with AI SDK:', error);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts using AI SDK
   * @param texts - Array of input texts to generate embeddings for
   * @returns Promise resolving to an array of EmbeddingResult containing the embedding vectors and usage information
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<EmbeddingResult[]> {
    try {
      const { embeddings, usage } = await embedMany({
        model: this.provider.embedding(this.embeddingModel),
        values: texts,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(60000), // 60 second timeout for batch
      });

      return embeddings.map((embedding) => ({
        embedding,
        model: this.embeddingModel,
        usage: {
          promptTokens: usage.tokens,
          totalTokens: usage.tokens,
        },
      }));
    } catch (error: any) {
      console.error('Error generating batch embeddings with AI SDK:', error);
      throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   * This is a utility function that comes with AI SDK
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    return cosineSimilarity(embedding1, embedding2);
  }

  async skillBenchmarking(data: any, industry: string, region: string, includeProjections = true): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.provider('gpt-4'),
        messages: [
          {
            role: 'system',
            content: systemPrompts.skill_benchmarking
          },
          {
            role: 'user',
            content: analysisTemplates.skill_benchmarking
          }
        ],
        temperature: 0.4,
        maxTokens: 2000,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(60000)
      });

      return text;
    } catch (error: any) {
      console.error('Error in skill benchmarking:', error);
      throw new Error(`Skill benchmarking failed: ${error.message}`);
    }
  }

  async compensationAnalysis(data: any, marketScope = 'national', includeEquityAnalysis = true): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.provider('gpt-4'),
        messages: [
          {
            role: 'system',
            content: systemPrompts.compensation_analyst
          },
          {
            role: 'user',
            content: analysisTemplates.compensation_analysis
          }
        ],
        temperature: 0.4,
        maxTokens: 2000,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(60000)
      });

      return text;
    } catch (error: any) {
      console.error('Error in compensation analysis:', error);
      throw new Error(`Compensation analysis failed: ${error.message}`);
    }
  }

  async generatePersonReport(data: any, reportType: string = 'comprehensive'): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.provider('gpt-4'),
        messages: [
          {
            role: 'system',
            content: `${systemPrompts.hr_manager}
${reportTypes}
${contextTemplate}
${peerComparisonTemplate}
${marketContextTemplate}
${marketIntelligenceTemplate}
${reportSpecifications}`
          },
          {
            role: 'user',
            content: analysisTemplates.career_recommendation
          }
        ],
        temperature: 0.4,
        maxTokens: 2000,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(60000)
      });

      return text;
    } catch (error: any) {
      console.error('Error generating person report:', error);
      throw new Error(`Person report generation failed: ${error.message}`);
    }
  }

  private buildContextualData(person: any): string {
    // Handle nested structure
    const firstName = person.personalInfo?.firstName || person.firstName || 'Unknown';
    const lastName = person.personalInfo?.lastName || person.lastName || '';
    const position = person.employmentDetails?.position || 'Not specified';
    const experience = this.calculateExperience(person);
    const education = this.getEducationSummary(person.education);
    const skills = person.skills?.slice(0, 5).map((s: any) => s.skillName).join(', ') || 'None';
    const technologies = person.technologies?.slice(0, 5).map((t: any) => t.technologyName).join(', ') || 'None';

    let context = contextTemplate
      .replace('${firstName}', firstName)
      .replace('${lastName}', lastName)
      .replace('${position}', position)
      .replace('${experience}', experience.toString())
      .replace('${education}', education)
      .replace('${skills}', skills)
      .replace('${technologies}', technologies);

    if (person.similarPersons?.length > 0) {
      const peers = person.similarPersons
        .slice(0, 3)
        .map((p: any, i: number) => `${i + 1}. ${p.personName} (${p.similarity}% similarity)`)
        .join('\n');
      context = context.replace('${peerComparison}', peerComparisonTemplate.replace('${peers}', peers));
    } else {
      context = context.replace('${peerComparison}', '');
    }

    if (person.skillsContext) {
      context = context.replace('${marketContext}', marketContextTemplate.replace('${context}', person.skillsContext));
    } else {
      context = context.replace('${marketContext}', '');
    }

    if (person.marketData) {
      context = context.replace('${marketIntelligence}', marketIntelligenceTemplate.replace('${data}', person.marketData));
    } else {
      context = context.replace('${marketIntelligence}', '');
    }

    return context;
  }

  private calculateExperience(person: any): number {
    // Implementation details...
    return 0;
  }

  private getEducationSummary(education: any): string {
    // Implementation details...
    return 'Not specified';
  }
} 