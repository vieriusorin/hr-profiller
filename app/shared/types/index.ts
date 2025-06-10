// Core domain types
export type OpportunityId = number;
export type RoleId = number;
export type MemberId = number;

export type OpportunityStatus = 'In Progress' | 'On Hold' | 'Done';
export type RoleStatus = 'Open' | 'Staffed' | 'Won' | 'Lost';
export type Grade = 'JT' | 'T' | 'ST' | 'EN' | 'SE' | 'C' | 'SC' |'SM';

export interface Member {
  id: MemberId;
  fullName: string;
  actualGrade: Grade;
  allocation: number;
  availableFrom: string;
}

export interface Role {
  id: RoleId;
  roleName: string;
  requiredGrade: Grade;
  status: RoleStatus;
  assignedMember: Member | null;
  needsHire: boolean;
  comments: string;
}

export interface Opportunity {
  id: OpportunityId;
  clientName: string;
  opportunityName: string;
  openDate: string;
  expectedStartDate: string;
  probability: number;
  status: OpportunityStatus;
  roles: Role[];
}

// Form types
export interface CreateOpportunityForm {
  clientName: string;
  opportunityName: string;
  expectedStartDate: string;
  probability: number;
}

export interface CreateRoleForm {
  roleName: string;
  requiredGrade: Grade;
  comments: string;
}

// Filter types
export interface OpportunityFilters {
  client: string;
  grades: Grade[];
  needsHire: 'yes' | 'no' | 'all';
}

// Validation error types
export interface ValidationErrors {
  [key: string]: string;
} 