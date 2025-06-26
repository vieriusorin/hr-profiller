import 'dotenv/config';
import { injectable } from 'inversify';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, embed, embedMany, cosineSimilarity } from 'ai';
import { systemPrompts } from '../../../infrastructure/prompts/system-prompts';
import { EmbeddingResult, ChatCompletionResult } from '../../../shared/types';

@injectable()
export class OpenAIService {
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
      compatibility: 'strict'
    });

    this.embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
    this.chatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
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
   * Generate chat completion using AI SDK
   * @param messages - Array of message objects representing the chat history
   * @param temperature - Sampling temperature for the model (default is 0.4)
   */
  async generateChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: number = 0.4
  ): Promise<ChatCompletionResult> {
    try {
      const { text, usage } = await generateText({
        model: this.provider(this.chatModel),
        messages,
        temperature,
        maxTokens: 2000,
        maxRetries: 3,
        abortSignal: AbortSignal.timeout(60000), // 60 second timeout
      });

      return {
        content: text,
        model: this.chatModel,
        usage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
        },
      };
    } catch (error: any) {
      console.error('Error generating chat completion with AI SDK:', error);
      throw new Error(`Failed to generate chat completion: ${error.message}`);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   * This is a utility function that comes with AI SDK
   * 
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    return cosineSimilarity(embedding1, embedding2);
  }

  /**
   * Generate person analysis using AI
   * This function analyzes a person's profile and suggests an internal grade based on provided criteria.
   * @param personData - The person's profile data to analyze
   * @param context - Optional additional context for the analysis
   */
  async analyzePerson(personData: any, context?: string): Promise<string> {
    const systemPrompt = systemPrompts.analyzePerson;

    const userPrompt = `Analyze the following person profile and return the suggested internal grade:
    
    ${JSON.stringify(personData, null, 2)}
    
    ${context ? `\nAdditional context: ${context}` : ''}
    
    Provide a comprehensive analysis focusing on their capabilities, strengths, and areas for development.`;

    const result = await this.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return result.content;
  }

  /**
   * Generate person report using AI
   */
  async generatePersonReport(personData: any, reportType: string = 'comprehensive'): Promise<string> {
    const systemPrompt = systemPrompts.personReport;

    const reportPrompts = {
      comprehensive: 'Create a comprehensive report covering all aspects of the person profile',
      skills: 'Focus on technical skills and capabilities analysis',
      career: 'Focus on career progression and development recommendations',
      summary: 'Create a concise executive summary of the person profile',
    };

    const userPrompt = `Generate a ${reportType} report for the following person:
    
    ${JSON.stringify(personData, null, 2)}
    
    ${reportPrompts[reportType as keyof typeof reportPrompts] || reportPrompts.comprehensive}`;

    const result = await this.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return result.content;
  }

  /**
   * Generate searchable text for person embedding
   */
  generatePersonSearchableText(person: any): string {
    const parts = [];

    // Basic info
    parts.push(`${person.firstName} ${person.lastName}`);
    parts.push(person.email);
    if (person.notes) parts.push(person.notes);

    // Skills
    if (person.skills && person.skills.length > 0) {
      const skillText = person.skills
        .map((s: any) => `${s.skillName} ${s.skillCategory || ''} ${s.proficiencyLevel || ''} ${s.yearsOfExperience || ''} years`)
        .join(' ');
      parts.push(skillText);
    }

    // Technologies
    if (person.technologies && person.technologies.length > 0) {
      const techText = person.technologies
        .map((t: any) => `${t.technologyName} ${t.technologyCategory || ''} ${t.technologyLevel || ''} ${t.yearsOfExperience || ''} years`)
        .join(' ');
      parts.push(techText);
    }

    // Education
    if (person.education && person.education.length > 0) {
      const eduText = person.education
        .map((e: any) => `${e.institution} ${e.degree || ''} ${e.fieldOfStudy || ''}`)
        .join(' ');
      parts.push(eduText);
    }

    return parts.join(' ').toLowerCase();
  }
} 