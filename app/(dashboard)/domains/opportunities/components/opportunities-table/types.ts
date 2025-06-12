import type { Opportunity, OpportunityStatus, RoleStatus } from '@/shared/types';
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
  opportunities: Opportunity[];
  showActions?: boolean;
}
