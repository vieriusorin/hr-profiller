import { Grade, Opportunity } from '@/app/shared/schemas/api-schemas';
import { ApiValidationError } from '../lib/api/validated-api';

// Re-export schema-derived types
export type {
  OpportunityId,
  RoleId,
  MemberId,
  OpportunityStatus,
  RoleStatus,
  Grade,
  OpportunityLevel,
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
} from '@/app/shared/schemas/api-schemas';

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

export interface OpportunityFilters {
  client: string;
  grades: Grade[];
  needsHire: 'yes' | 'no' | 'all';
  probability: [number, number];
}

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

export type ApiErrorDisplayProps = {
	error: ApiValidationError | Error | null;
	onRetry?: () => void;
	showDetails?: boolean;
	fallbackMessage?: string;
}

export type ValidationErrorDetailsProps = {
	error: ApiValidationError;
}

export interface MonthGroup {
  monthKey: string;
  monthLabel: string;
  opportunities: Opportunity[];
}

export interface ProbabilityBadgeProps {
  probability: number;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}