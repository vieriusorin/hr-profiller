import type { Opportunity as OpportunityInterface, OpportunityStatus, RoleStatus } from '@/shared/types';
import type { OpportunityActionCallbacks } from '../../types';

export interface FlattenedRow {
  opportunityId: string;
  opportunityName: string;
  clientName: string;
  expectedStartDate: string;
  probability: number;
  opportunityStatus: OpportunityStatus;
  rolesCount: number;
  hasHiringNeeds: boolean;
  comment?: string;
  roleId?: string;
  roleName?: string;
  requiredGrade?: string;
  roleStatus?: RoleStatus;
  assignedMember?: string;
  needsHire?: boolean;
  allocation?: number;
  isFirstRowForOpportunity: boolean;
  isOpportunityRow?: boolean;
  isRoleRow?: boolean;
  rowSpan: number;
}

export interface OpportunitiesTableProps extends OpportunityActionCallbacks {
  opportunities: OpportunityInterface[];
  showActions?: boolean;
}

export interface Opportunity {
  id: string;
  name: string;
  clientName: string;
  expectedStartDate: string;
  probability: number;
  status: 'In Progress' | 'On Hold' | 'Completed';
  hasHiringNeeds: boolean;
  comment?: string;
  rolesCount: number;
}

export interface Role {
  id: string;
  roleName: string;
  requiredGrade?: string;
  status: 'Open' | 'Won' | 'Staffed' | 'Lost';
  assignedMember?: string;
  allocation?: number;
  needsHire: boolean;
  comments?: string;
}

export interface TableRow {
  isOpportunityRow: boolean;
  opportunityId: string;
  opportunityName: string;
  clientName: string;
  expectedStartDate: string;
  probability: number;
  opportunityStatus: 'In Progress' | 'On Hold' | 'Completed';
  hasHiringNeeds: boolean;
  comment?: string;
  rolesCount: number;
  rowSpan: number;
  isFirstRowForOpportunity: boolean;
  roleId?: string;
  roleName?: string;
  requiredGrade?: string;
  roleStatus?: 'Open' | 'Won' | 'Staffed' | 'Lost';
  assignedMember?: string;
  allocation?: number;
  needsHire?: boolean;
}

export interface OpportunitiesTableRowProps {
  row: TableRow;
  showActions: boolean;
  onAddRole: (opportunityId: string) => void;
  onUpdateRole: (opportunityId: string, roleId: string, status: 'Won' | 'Staffed' | 'Lost') => void;
  onMoveToHold: (opportunityId: string) => void;
  onMoveToInProgress: (opportunityId: string) => void;
  onMoveToCompleted: (opportunityId: string) => void;
}


export type ConfirmationDialogState = {
  isOpen: boolean;
  status: 'Won' | 'Staffed' | 'Lost';
  opportunityId: string;
  roleId: string;
  roleName?: string;
}