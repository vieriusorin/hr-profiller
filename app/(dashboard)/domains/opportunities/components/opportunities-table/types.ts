import type { Opportunity, OpportunityStatus, RoleStatus } from '@/shared/types';

export interface FlattenedRow {
  opportunityId: string;
  opportunityName: string;
  clientName: string;
  expectedStartDate: string;
  probability: number;
  opportunityStatus: OpportunityStatus;
  rolesCount: number;
  hasHiringNeeds: boolean;
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

export interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  showActions?: boolean;
  onAddRole?: (opportunityId: string) => void;
  onUpdateRole?: (opportunityId: string, roleId: string, status: string) => void;
  onMoveToHold?: (opportunityId: string) => void;
  onMoveToInProgress?: (opportunityId: string) => void;
  onMoveToCompleted?: (opportunityId: string) => void;
}
