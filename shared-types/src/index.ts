// Core response envelope types
export interface ResponseEnvelope<T> {
  status: 'success' | 'error';
  data: T;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
  stack?: string;
}

// MCP Tool interfaces
export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  capabilities?: string[];
}

export interface McpToolEndpoint {
  name: string;
  endpoint: string;
  method: string;
  description: string;
}

// Request interfaces
export interface AnalysisRequest {
  data: string;
  analysisType?: string;
  userRole?: string;
  urgency?: string;
  confidentialityLevel?: string;
}

export interface ReportRequest {
  data: string;
  reportType?: string;
  userRole?: string;
  includeMetrics?: boolean;
  confidentialityLevel?: string;
}

export interface BenchmarkingRequest {
  data: string;
  industry?: string;
  region?: string;
  includeProjections?: boolean;
}

export interface CompensationRequest {
  data: string;
  marketScope?: string;
  includeEquityAnalysis?: boolean;
}

// Response interfaces
export interface AnalysisResponse {
  analysis: string;
  confidence: number;
  recommendations: string[];
  metadata: {
    analysisType: string;
    userRole: string;
    urgency: string;
    confidentialityLevel: string;
    processingTime: number;
    modelUsed: string;
    tokensUsed: number;
    timestamp: string;
  };
}

export interface ReportResponse {
  report: string;
  metadata: {
    reportType: string;
    userRole: string;
    includeMetrics: boolean;
    confidentialityLevel: string;
    processingTime: number;
    modelUsed: string;
    tokensUsed: number;
    timestamp: string;
  };
}

// Legacy compatibility - McpToolResult for backward compatibility
export interface McpToolResult {
  // New format (preferred)
  data?: {
    analysis: string;
    confidence: number;
    recommendations: string[];
    metadata: {
      analysisType: string;
      userRole: string;
      urgency: string;
      confidentialityLevel: string;
      processingTime: number;
      modelUsed: string;
      tokensUsed: number;
      timestamp: string;
    };
  };
  status?: 'success' | 'error';
  meta?: {
    timestamp: string;
    processingTime?: number;
  };
  
  // Legacy format (for backward compatibility)
  content?: any;
  isError?: boolean;
  error?: string;
  metadata?: {
    executionTime?: number;
    tokensUsed?: number;
    modelUsed?: string;
    confidence?: number;
    timestamp?: string;
    [key: string]: any;
  };
}

// Health check interface
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  service: string;
  capabilities: string[];
  timestamp: string;
  version: string;
}

// Enums for consistency
export enum AnalysisType {
  CAPABILITY_ANALYSIS = 'capability_analysis',
  PERFORMANCE_REVIEW = 'performance_review',
  SKILL_ASSESSMENT = 'skill_assessment',
  COMPENSATION_ANALYSIS = 'compensation_analysis',
  MARKET_ANALYSIS = 'market_analysis'
}

export enum UserRole {
  HR_MANAGER = 'hr_manager',
  TEAM_LEAD = 'team_lead',
  EXECUTIVE = 'executive',
  ANALYST = 'analyst',
  ADMIN = 'admin'
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

// Tool execution interfaces
export interface ToolExecutionRequest {
  toolName: string;
  arguments: Record<string, any>;
}

export interface ToolExecutionResponse extends ResponseEnvelope<any> {
  executionTime?: number;
}

// Validation schemas (for runtime validation)
export const ANALYSIS_TYPES = Object.values(AnalysisType);
export const USER_ROLES = Object.values(UserRole);
export const URGENCY_LEVELS = Object.values(UrgencyLevel);
export const CONFIDENTIALITY_LEVELS = Object.values(ConfidentialityLevel); 