export type OpportunityId = string;
export type RoleId = string;
export type MemberId = string;

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

export interface BaseRole {
  roleName: string;
  requiredGrade: Grade;
  allocation: number;
  comments: string;
}

export interface BaseOpportunity {
  clientName: string;
  opportunityName: string;
  expectedStartDate: string;
  probability: number;
}

export interface Role extends BaseRole {
  id: RoleId;
  status: RoleStatus;
  assignedMember: Member | null;
  needsHire: boolean;
}

export interface Opportunity extends BaseOpportunity {
  id: OpportunityId;
  createdAt: string;
  status: OpportunityStatus;
  roles: Role[];
}

export interface CreateOpportunityForm extends BaseOpportunity {}

export interface CreateRoleForm extends BaseRole {}

export interface EditRoleForm extends BaseRole {
  id: RoleId;
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
