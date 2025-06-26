T5b78hd5wV9ti8y!import {
  AnalysisRequest,
  ReportRequest,
  BenchmarkingRequest,
  CompensationRequest,
  AnalysisType,
  UserRole,
  UrgencyLevel,
  ConfidentialityLevel,
  ANALYSIS_TYPES,
  USER_ROLES,
  URGENCY_LEVELS,
  CONFIDENTIALITY_LEVELS
} from './index';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Request validation functions
export function validateAnalysisRequest(request: any): ValidationResult {
  const errors: string[] = [];

  if (!request.data || typeof request.data !== 'string') {
    errors.push('data is required and must be a string');
  }

  if (request.analysisType && !ANALYSIS_TYPES.includes(request.analysisType)) {
    errors.push(`analysisType must be one of: ${ANALYSIS_TYPES.join(', ')}`);
  }

  if (request.userRole && !USER_ROLES.includes(request.userRole)) {
    errors.push(`userRole must be one of: ${USER_ROLES.join(', ')}`);
  }

  if (request.urgency && !URGENCY_LEVELS.includes(request.urgency)) {
    errors.push(`urgency must be one of: ${URGENCY_LEVELS.join(', ')}`);
  }

  if (request.confidentialityLevel && !CONFIDENTIALITY_LEVELS.includes(request.confidentialityLevel)) {
    errors.push(`confidentialityLevel must be one of: ${CONFIDENTIALITY_LEVELS.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateReportRequest(request: any): ValidationResult {
  const errors: string[] = [];

  if (!request.data || typeof request.data !== 'string') {
    errors.push('data is required and must be a string');
  }

  if (request.userRole && !USER_ROLES.includes(request.userRole)) {
    errors.push(`userRole must be one of: ${USER_ROLES.join(', ')}`);
  }

  if (request.confidentialityLevel && !CONFIDENTIALITY_LEVELS.includes(request.confidentialityLevel)) {
    errors.push(`confidentialityLevel must be one of: ${CONFIDENTIALITY_LEVELS.join(', ')}`);
  }

  if (request.includeMetrics !== undefined && typeof request.includeMetrics !== 'boolean') {
    errors.push('includeMetrics must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Type guards
export function isAnalysisRequest(obj: any): obj is AnalysisRequest {
  return obj && typeof obj.data === 'string';
}

export function isReportRequest(obj: any): obj is ReportRequest {
  return obj && typeof obj.data === 'string';
}

// Sanitization functions
export function sanitizeAnalysisRequest(request: any): AnalysisRequest {
  return {
    data: request.data,
    analysisType: ANALYSIS_TYPES.includes(request.analysisType) ? request.analysisType : AnalysisType.CAPABILITY_ANALYSIS,
    userRole: USER_ROLES.includes(request.userRole) ? request.userRole : UserRole.HR_MANAGER,
    urgency: URGENCY_LEVELS.includes(request.urgency) ? request.urgency : UrgencyLevel.STANDARD,
    confidentialityLevel: CONFIDENTIALITY_LEVELS.includes(request.confidentialityLevel) ? request.confidentialityLevel : ConfidentialityLevel.INTERNAL
  };
}

export function sanitizeReportRequest(request: any): ReportRequest {
  return {
    data: request.data,
    reportType: request.reportType,
    userRole: USER_ROLES.includes(request.userRole) ? request.userRole : UserRole.HR_MANAGER,
    includeMetrics: typeof request.includeMetrics === 'boolean' ? request.includeMetrics : false,
    confidentialityLevel: CONFIDENTIALITY_LEVELS.includes(request.confidentialityLevel) ? request.confidentialityLevel : ConfidentialityLevel.INTERNAL
  };
} 