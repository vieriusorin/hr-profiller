import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/types';
import { Analysis, AnalysisType, UserRole, UrgencyLevel, ConfidentialityLevel } from '../entities/analysis.entity';
import { AnalysisRequest, AnalysisResponse } from '../../shared/types';

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

export interface McpPromptEngineService {
  generateAnalysisPrompt(analysis: Analysis): Promise<string>;
  extractInsights(rawResult: string): {
    analysis: string;
    confidence: number;
    recommendations: string[];
  };
}

@injectable()
export class McpAnalysisService {
  constructor(
    @inject(TYPES.OpenAIService)
    private readonly openAIService: OpenAIService,
    @inject(TYPES.McpPromptEngineService)
    private readonly promptEngine: McpPromptEngineService
  ) {}

  async analyzeData(request: AnalysisRequest): Promise<AnalysisResponse> {
    // Create analysis entity
    const analysis = new Analysis({
      content: request.data,
      analysisType: this.parseAnalysisType(request.analysisType),
      userRole: this.parseUserRole(request.userRole),
      urgency: this.parseUrgencyLevel(request.urgency),
      confidentialityLevel: this.parseConfidentialityLevel(request.confidentialityLevel),
      metadata: { requestId: this.generateRequestId() }
    });

    // Validate the analysis
    analysis.validateForAnalysis();

    const startTime = Date.now();

    try {
      // Generate AI prompt based on analysis context
      const prompt = await this.promptEngine.generateAnalysisPrompt(analysis);
      
      // Get optimal model configuration
      const modelConfig = analysis.getOptimalModelConfig();
      
      // Generate AI completion
      const aiResult = await this.openAIService.generateCompletion(prompt, {
        model: modelConfig.model,
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens
      });

      // Extract insights from AI result
      const insights = this.promptEngine.extractInsights(aiResult.content);
      
      // Set analysis result
      analysis.setResult(insights.analysis, insights.confidence, insights.recommendations);
      
      // Set processing metadata
      const processingTime = Date.now() - startTime;
      analysis.setProcessingMetadata({
        processingTime,
        modelUsed: aiResult.model,
        tokensUsed: aiResult.tokensUsed,
        timestamp: new Date().toISOString()
      });

      // Return structured response
      return {
        analysis: insights.analysis,
        confidence: insights.confidence,
        recommendations: insights.recommendations,
        metadata: {
          analysisType: analysis.analysisType,
          userRole: analysis.userRole,
          urgency: analysis.urgency,
          confidentialityLevel: analysis.confidentialityLevel,
          processingTime,
          modelUsed: aiResult.model,
          tokensUsed: aiResult.tokensUsed,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Analysis failed:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAnalysisConfidence(data: string): Promise<{
    confidence: number;
    level: string;
    recommendations: string[];
    timestamp: string;
  }> {
    try {
      // Create a confidence analysis entity
      const analysis = new Analysis({
        content: data,
        analysisType: AnalysisType.CAPABILITY_ANALYSIS,
        userRole: UserRole.HR_MANAGER,
        urgency: UrgencyLevel.STANDARD,
        confidentialityLevel: ConfidentialityLevel.INTERNAL
      });

      const confidence = await this.calculateConfidenceScore(analysis);
      const level = this.getConfidenceLevel(confidence);
      const recommendations = this.generateConfidenceRecommendations(confidence, analysis);

      return {
        confidence,
        level,
        recommendations,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Confidence analysis failed:', error);
      throw new Error(`Confidence analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods
  private parseAnalysisType(type?: string): AnalysisType {
    if (!type) return AnalysisType.CAPABILITY_ANALYSIS;
    
    const analysisType = Object.values(AnalysisType).find(t => t === type);
    return analysisType || AnalysisType.CAPABILITY_ANALYSIS;
  }

  private parseUserRole(role?: string): UserRole {
    if (!role) return UserRole.HR_MANAGER;
    
    const userRole = Object.values(UserRole).find(r => r === role);
    return userRole || UserRole.HR_MANAGER;
  }

  private parseUrgencyLevel(urgency?: string): UrgencyLevel {
    if (!urgency) return UrgencyLevel.STANDARD;
    
    const urgencyLevel = Object.values(UrgencyLevel).find(u => u === urgency);
    return urgencyLevel || UrgencyLevel.STANDARD;
  }

  private parseConfidentialityLevel(level?: string): ConfidentialityLevel {
    if (!level) return ConfidentialityLevel.INTERNAL;
    
    const confidentialityLevel = Object.values(ConfidentialityLevel).find(c => c === level);
    return confidentialityLevel || ConfidentialityLevel.INTERNAL;
  }

  private async calculateConfidenceScore(analysis: Analysis): Promise<number> {
    // Basic confidence calculation based on data completeness and structure
    let score = 0.5; // Base score

    // Content length assessment
    if (analysis.content.length > 100) score += 0.2;
    if (analysis.content.length > 500) score += 0.1;

    // Structure assessment (JSON, specific fields, etc.)
    try {
      const parsed = JSON.parse(analysis.content);
      if (parsed && typeof parsed === 'object') {
        score += 0.1;
        
        // Check for key fields
        const keyFields = ['skills', 'experience', 'name', 'position'];
        const foundFields = keyFields.filter(field => 
          Object.keys(parsed).some(key => key.toLowerCase().includes(field))
        );
        score += (foundFields.length / keyFields.length) * 0.1;
      }
    } catch {
      // Not JSON, check for structured text
      const hasStructuredData = /\b(skills?|experience|years?|position|role)\b/i.test(analysis.content);
      if (hasStructuredData) score += 0.05;
    }

    return Math.min(Math.max(score, 0), 1); // Clamp between 0 and 1
  }

  private getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  private generateConfidenceRecommendations(confidence: number, analysis: Analysis): string[] {
    const recommendations: string[] = [];

    if (confidence < 0.6) {
      recommendations.push('Provide more structured data for better analysis');
      recommendations.push('Include specific details about skills and experience');
    }

    if (analysis.content.length < 200) {
      recommendations.push('Provide more detailed information for comprehensive analysis');
    }

    try {
      JSON.parse(analysis.content);
    } catch {
      recommendations.push('Consider providing data in JSON format for optimal processing');
    }

    if (recommendations.length === 0) {
      recommendations.push('Data quality is good for accurate analysis');
    }

    return recommendations;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 