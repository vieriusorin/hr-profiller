
export interface ResponseEnvelope<T> {
  status: 'success' | 'error';
  data: T;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: any; // For validation errors and other detailed error information
  stack?: string;
}


const TYPES = {
  // External Services
  OpenAIService: Symbol.for('OpenAIService'),
  
  // Domain Services
  McpAnalysisService: Symbol.for('McpAnalysisService'),
  McpReportService: Symbol.for('McpReportService'),
  McpBenchmarkingService: Symbol.for('McpBenchmarkingService'),
  McpPromptEngineService: Symbol.for('McpPromptEngineService'),
  
  // Infrastructure Services
  McpServerService: Symbol.for('McpServerService'),
  
  // Controllers
  McpToolsController: Symbol.for('McpToolsController'),
  HealthController: Symbol.for('HealthController'),
  
  // Repositories (if needed for future data persistence)
  AnalysisRepository: Symbol.for('AnalysisRepository'),
  
  // Middleware
  AuthenticationMiddleware: Symbol.for('AuthenticationMiddleware'),
  AuthorizationMiddleware: Symbol.for('AuthorizationMiddleware'),
};

export { TYPES };


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


export interface McpToolResult {
  content: any;
  isError: boolean;
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


export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  service: string;
  capabilities: string[];
  timestamp: string;
  version: string;
}


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