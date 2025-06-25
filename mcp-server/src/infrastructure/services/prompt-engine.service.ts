import { injectable } from 'inversify';
import { Analysis } from '../../domain/entities/analysis.entity';
import { McpPromptEngineService } from '../../domain/services/mcp-analysis.service';
import { analysisTypePrompts } from '../prompts/analysis-types';
import { confidentialityNotes } from '../prompts/confidentiality-notes';
import { baseTemplate } from '../prompts/base-template';

@injectable()
export class PromptEngineServiceImpl implements McpPromptEngineService {
  
  async generateAnalysisPrompt(analysis: Analysis): Promise<string> {
    const personaContext = analysis.getPersonaContext();
    const analysisTypePrompt = this.getAnalysisTypePrompt(analysis.analysisType);
    const confidentialityNote = this.getConfidentialityNote(analysis.confidentialityLevel);
    
    // Replace template variables
    return baseTemplate
      .replace('${personaContext}', personaContext)
      .replace('${analysisType}', analysis.analysisType)
      .replace('${urgency}', analysis.urgency)
      .replace('${confidentialityLevel}', analysis.confidentialityLevel)
      .replace('${analysisTypePrompt}', analysisTypePrompt)
      .replace('${content}', analysis.content)
      .replace('${confidentialityNote}', confidentialityNote);
  }

  extractInsights(rawResult: string): {
    analysis: string;
    confidence: number;
    recommendations: string[];
  } {
    // Extract confidence score - look for both numeric and textual representations
    const confidenceMatch = rawResult.match(/confidence[^\d]*(\d+(?:\.\d+)?)/i) || 
                          rawResult.match(/(\d+(?:\.\d+)?)[^\d]*confidence/i);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7;

    // Extract recommendations - look for both bullet points and numbered lists
    const recommendationsRegex = /recommendations?:?\s*((?:[-•*\d\s]+[^\n]+\n?)+)/i;
    const recommendationsMatch = rawResult.match(recommendationsRegex);
    let recommendations: string[] = [];
    
    if (recommendationsMatch) {
      recommendations = recommendationsMatch[1]
        .split(/\n/)
        .map(line => line.replace(/^[-•*\d\s]+/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 5);  // Limit to 5 recommendations
    }

    // If no recommendations found, try to extract from sentences
    if (recommendations.length === 0) {
      const sentences = rawResult.split(/[.!?]+/);
      recommendations = sentences
        .filter(s => s.toLowerCase().includes('recommend') || s.toLowerCase().includes('should'))
        .map(s => s.trim())
        .filter(s => s.length > 20)
        .slice(0, 5);
    }

    // Clean up the analysis text
    let analysis = rawResult;
    
    // Remove confidence section
    analysis = analysis.replace(/confidence[^\n]*(0\.\d+|[01])[^\n]*(\n|$)/ig, '');
    
    // Remove recommendations section if it exists as a distinct section
    if (recommendationsMatch) {
      analysis = analysis.replace(recommendationsRegex, '');
    }

    // Clean up any remaining markdown or section headers
    analysis = analysis
      .replace(/^#+ /gm, '')  // Remove markdown headers
      .replace(/\n{3,}/g, '\n\n')  // Normalize multiple newlines
      .trim();

    return {
      analysis,
      confidence: Math.min(Math.max(confidence, 0), 1), // Clamp between 0 and 1
      recommendations: recommendations.length > 0 ? recommendations : ['No specific recommendations provided']
    };
  }

  private getAnalysisTypePrompt(analysisType: string): string {
    return analysisTypePrompts[analysisType as keyof typeof analysisTypePrompts] || 
           analysisTypePrompts.capability_analysis;
  }

  private getConfidentialityNote(level: string): string {
    return confidentialityNotes[level as keyof typeof confidentialityNotes] || 
           confidentialityNotes.internal;
  }

  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`###\\s*${sectionName}[\\s\\S]*?(?=###|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0] : '';
  }

  private parseRecommendations(recommendationsSection: string): string[] {
    if (!recommendationsSection) return [];
    
    // Split by lines and extract recommendation items
    const lines = recommendationsSection.split('\n');
    const recommendations: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for numbered lists, bullet points, or dashes
      if (trimmed.match(/^[\d\-\*\•]\s*/) || trimmed.startsWith('- ')) {
        const cleaned = trimmed.replace(/^[\d\-\*\•\s]+/, '').trim();
        if (cleaned.length > 10) { // Only include substantial recommendations
          recommendations.push(cleaned);
        }
      }
    }
    
    // If no formatted recommendations found, extract from sentences
    if (recommendations.length === 0) {
      const sentences = recommendationsSection.split(/[.!?]+/);
      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed.length > 20 && trimmed.toLowerCase().includes('recommend')) {
          recommendations.push(trimmed);
        }
      }
    }
    
    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }
} 