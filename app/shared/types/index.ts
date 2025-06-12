// Re-export schema-derived types
export type {
  OpportunityId,
  RoleId,
  MemberId,
  OpportunityStatus,
  RoleStatus,
  Grade,
  Member,
  Client,
  Opportunity,
  Role,
  CreateOpportunityForm,
  CreateRoleForm,
  EditRoleForm,
  CreateOpportunityInput,
  CreateRoleInput,
  EditOpportunityForm,
} from '../schemas/api-schemas';

// Import types for use in interfaces below
import type { Grade } from '../schemas/api-schemas';

// Frontend-specific types that don't exist in schemas
export interface BaseRole {
  roleName: string;
  requiredGrade: Grade;
  allocation: number;
  comments: string;
  needsHire: boolean;
}

export interface BaseOpportunity {
  clientName: string;
  opportunityName: string;
  expectedStartDate: string;
  probability: number;
}

// Filter types
export interface OpportunityFilters {
  client: string;
  grades: Grade[];
  needsHire: 'yes' | 'no' | 'all';
  probability: [number, number]; // Value between 0 and 100
}

// Validation error types
export interface ValidationErrors {
  [key: string]: string;
} 


export type UrgencyLevel = 'urgent' | 'warning' | 'safe';

export interface UrgencyConfig {
  colorClass: string;
  label: string;
  bgClass: string;
  textClass: string;
}

export interface GradeOption {
  value: Grade;
  label: string;
}