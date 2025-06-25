export interface AnalysisData {
  content: string;
  analysisType: AnalysisType;
  userRole: UserRole;
  urgency: UrgencyLevel;
  confidentialityLevel: ConfidentialityLevel;
  metadata?: Record<string, any>;
}

export enum AnalysisType {
  CAPABILITY_ANALYSIS = 'capability_analysis',
  SKILL_GAP = 'skill_gap',
  CAREER_RECOMMENDATION = 'career_recommendation',
  PERFORMANCE_OPTIMIZATION = 'performance_optimization',
  SUCCESSION_PLANNING = 'succession_planning',
  DIVERSITY_ANALYTICS = 'diversity_analytics',
  COMPENSATION_EQUITY = 'compensation_equity',
  HIPO_IDENTIFICATION = 'hipo_identification',
  CULTURE_FIT = 'culture_fit',
  RETENTION_RISK = 'retention_risk',
  TEAM_DYNAMICS = 'team_dynamics'
}

export enum UserRole {
  HR_MANAGER = 'hr_manager',
  EMPLOYEE = 'employee',
  EXECUTIVE = 'executive',
  RECRUITER = 'recruiter',
  TEAM_LEAD = 'team_lead'
}

export enum UrgencyLevel {
  IMMEDIATE = 'immediate',
  STANDARD = 'standard',
  STRATEGIC = 'strategic'
}

export enum ConfidentialityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

export class Analysis {
  readonly id: string;
  readonly content: string;
  readonly analysisType: AnalysisType;
  readonly userRole: UserRole;
  readonly urgency: UrgencyLevel;
  readonly confidentialityLevel: ConfidentialityLevel;
  readonly metadata: Record<string, any>;
  readonly createdAt: Date;

  private _result?: string;
  private _confidence?: number;
  private _recommendations?: string[];
  private _processingMetadata?: Record<string, any>;

  constructor(data: AnalysisData) {
    this.id = this.generateId();
    this.content = data.content;
    this.analysisType = data.analysisType;
    this.userRole = data.userRole;
    this.urgency = data.urgency;
    this.confidentialityLevel = data.confidentialityLevel;
    this.metadata = data.metadata || {};
    this.createdAt = new Date();
  }

  // Business methods
  setResult(result: string, confidence: number, recommendations: string[] = []): void {
    if (!result.trim()) {
      throw new Error('Analysis result cannot be empty');
    }
    if (confidence < 0 || confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
    
    this._result = result;
    this._confidence = confidence;
    this._recommendations = recommendations;
  }

  setProcessingMetadata(metadata: Record<string, any>): void {
    this._processingMetadata = { ...metadata };
  }

  get result(): string | undefined {
    return this._result;
  }

  get confidence(): number | undefined {
    return this._confidence;
  }

  get recommendations(): string[] {
    return this._recommendations || [];
  }

  get processingMetadata(): Record<string, any> {
    return this._processingMetadata || {};
  }

  get isCompleted(): boolean {
    return !!this._result;
  }

  get isHighConfidence(): boolean {
    return (this._confidence || 0) >= 0.8;
  }

  get isUrgent(): boolean {
    return this.urgency === UrgencyLevel.IMMEDIATE;
  }

  get isHighlyConfidential(): boolean {
    return this.confidentialityLevel === ConfidentialityLevel.RESTRICTED ||
           this.confidentialityLevel === ConfidentialityLevel.CONFIDENTIAL;
  }

  // Validation methods
  validateForAnalysis(): void {
    if (!this.content.trim()) {
      throw new Error('Analysis content cannot be empty');
    }
    if (this.content.length < 10) {
      throw new Error('Analysis content is too short for meaningful analysis');
    }
  }

  // Utility methods
  getPersonaContext(): string {
    const personas = {
      [UserRole.HR_MANAGER]: 'Strategic HR professional focused on talent optimization',
      [UserRole.EMPLOYEE]: 'Individual contributor seeking professional development',
      [UserRole.EXECUTIVE]: 'Senior leader focused on organizational strategy',
      [UserRole.RECRUITER]: 'Talent acquisition specialist evaluating candidates',
      [UserRole.TEAM_LEAD]: 'Team manager optimizing team performance'
    };
    return personas[this.userRole];
  }

  getOptimalModelConfig(): { model: string; temperature: number; maxTokens: number } {
    const configs = {
      [UrgencyLevel.IMMEDIATE]: { model: 'gpt-3.5-turbo', temperature: 0.3, maxTokens: 2000 },
      [UrgencyLevel.STANDARD]: { model: 'gpt-4', temperature: 0.5, maxTokens: 4000 },
      [UrgencyLevel.STRATEGIC]: { model: 'gpt-4', temperature: 0.7, maxTokens: 6000 }
    };
    return configs[this.urgency];
  }

  toSummary(): {
    id: string;
    analysisType: string;
    userRole: string;
    urgency: string;
    isCompleted: boolean;
    confidence?: number;
    createdAt: Date;
  } {
    return {
      id: this.id,
      analysisType: this.analysisType,
      userRole: this.userRole,
      urgency: this.urgency,
      isCompleted: this.isCompleted,
      confidence: this.confidence,
      createdAt: this.createdAt
    };
  }

  private generateId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 