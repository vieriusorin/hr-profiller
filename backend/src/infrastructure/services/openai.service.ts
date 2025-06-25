import { injectable } from 'inversify';
import OpenAI from 'openai';

import { systemPrompts } from '../prompts/system-prompts';
import { analysisTemplates } from '../prompts/analysis-templates';
import { reportSpecifications, reportTypes, contextTemplate, peerComparisonTemplate, marketContextTemplate, marketIntelligenceTemplate } from '../prompts/report-templates';

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
        model: options?.model || 'gpt-4o-mini',
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

  async skillBenchmarking(data: any, industry: string, region: string, includeProjections = true): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
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
        max_tokens: 2500
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error in skill benchmarking:', error);
      throw new Error('Failed to perform skill benchmarking analysis');
    }
  }

  async compensationAnalysis(data: any, marketScope = 'national', includeEquityAnalysis = true): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
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
        temperature: 0.3,
        max_tokens: 2500
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error in compensation analysis:', error);
      throw new Error('Failed to perform compensation analysis');
    }
  }

  async generatePersonReport(personData: any, reportType: string = 'comprehensive'): Promise<string> {
    try {
      const systemPrompt = systemPrompts.hr_manager;
      const reportPrompt = reportTypes[reportType as keyof typeof reportTypes] || reportTypes.comprehensive;

      const context = this.buildContextualData(personData);

      const userPrompt = `Generate a ${reportType} report for the following person:
    
${context}
    
${reportPrompt}

${reportSpecifications}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2500
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating person report:', error);
      throw new Error('Failed to generate person report');
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