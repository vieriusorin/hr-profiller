// Type compatibility layer for migration from old schema to new API client types
import type {
  Opportunity as ApiOpportunity,
  Role as ApiRole,
  Employee as ApiEmployee,
  CreateOpportunity as ApiCreateOpportunity,
  UpdateOpportunity as ApiUpdateOpportunity,
  CreateRole as ApiCreateRole,
  UpdateRole as ApiUpdateRole
} from '@/lib/api-client';

// Import enum types from generated backend types (single source of truth)
import type {
  JobGrade,
  OpportunityStatus,
  RoleStatus,
  OpportunityLevel,
  EmployeeStatus,
  WorkStatus
} from '@/lib/backend-types/enums';

// Re-export API types with backward compatible names
export type Opportunity = ApiOpportunity;
export type Role = ApiRole;
export type Employee = ApiEmployee;
export type CreateOpportunity = ApiCreateOpportunity;
export type UpdateOpportunity = ApiUpdateOpportunity;
export type CreateRole = ApiCreateRole;
export type UpdateRole = ApiUpdateRole;

// Type aliases for backward compatibility
export type OpportunityId = string;
export type RoleId = string;
export type MemberId = string;

// Export enum types from generated backend types (source of truth)
export type Grade = JobGrade;
export type { OpportunityStatus };
export type { RoleStatus };
export type { OpportunityLevel };
export type { EmployeeStatus };
export type { WorkStatus };

// Member type (mapped from Employee)
export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  position?: string | null;
  employeeStatus?: EmployeeStatus | null;
  workStatus?: WorkStatus | null;
  jobGrade?: Grade | null;
  location?: string | null;
  yearsOfExperience: number;
  isActive: boolean;
  skills?: Array<{
    id?: string;
    name?: string;
    proficiencyLevel?: string;
    yearsOfExperience?: number;
  }>;
};

// Client type (extracted from Opportunity)
export type Client = {
  id?: string;
  name: string;
};

// Form types for backward compatibility
export type CreateOpportunityForm = {
  opportunityName: string;
  clientName: string;
  expectedStartDate?: string | null;
  expectedEndDate?: string | null;
  probability?: number | null;
  status: OpportunityStatus;
  comment?: string | null;
};

export type CreateRoleForm = {
  opportunityId: string;
  roleName: string;
  jobGrade?: Grade | null;
  level?: OpportunityLevel | null;
  allocation?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status: RoleStatus;
  notes?: string | null;
};

export type EditRoleForm = Partial<CreateRoleForm>;
export type EditOpportunityForm = Partial<CreateOpportunityForm>;

// Input types (same as form types for now)
export type CreateOpportunityInput = CreateOpportunityForm;
export type CreateRoleInput = CreateRoleForm;

// Filter and UI types
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
  client: string;          // Required to match OpportunityFiltersState
  grades: Grade[];         // Required to match OpportunityFiltersState
  needsHire: 'yes' | 'no' | 'all';  // Required to match OpportunityFiltersState
  probability: [number, number];    // Required to match OpportunityFiltersState
  // Add additional backend-supported filters (optional)
  status?: OpportunityStatus;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  // Search and pagination
  search?: string;
  page?: number;
  limit?: number;
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

// API Error types
export interface ApiValidationError extends Error {
  status: number;
  statusText: string;
  data?: any;
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