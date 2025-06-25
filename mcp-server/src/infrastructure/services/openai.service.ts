import { injectable } from 'inversify';
import OpenAI from 'openai';
import { OpenAIService } from '../../domain/services/mcp-analysis.service';

@injectable()
export class OpenAIServiceImpl implements OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
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
      const completion = await this.openai.chat.completions.create({
        model: options?.model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4000,
      });

      const content = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;
      const model = completion.model;

      return {
        content,
        tokensUsed,
        model
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 