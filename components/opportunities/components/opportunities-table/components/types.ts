import type { FlattenedRow } from '../types';
import type { OpportunityActionCallbacks } from '../../../types';

export interface OpportunitiesTableRowProps extends OpportunityActionCallbacks {
  row: FlattenedRow;
  showActions: boolean;
}

export type RoleRowProps = {
  row: FlattenedRow;
  showActions: boolean;
  onStatusClick: (opportunityId: string, roleId: string, status: 'Won' | 'Staffed' | 'Lost', roleName?: string) => void;
}

export type OpportunityRowProps = {
  row: FlattenedRow;
  showActions: boolean;
  onAddRole: (opportunityId: string) => void;
  onMoveToHold: (opportunityId: string) => void;
  onMoveToInProgress: (opportunityId: string) => void;
  onMoveToCompleted: (opportunityId: string) => void;
  onEditOpportunity: () => void;
}

export type OpportunityActionsProps = {
  opportunityId: string;
  opportunityStatus: string;
  onAddRole: (opportunityId: string) => void;
  onMoveToHold: (opportunityId: string) => void;
  onMoveToInProgress: (opportunityId: string) => void;
  onMoveToCompleted: (opportunityId: string) => void;
}

export type RoleStatusDropdownProps = {
  opportunityId: string;
  roleId: string;
  roleName?: string;
  onStatusClick: (opportunityId: string, roleId: string, status: 'Won' | 'Staffed' | 'Lost', roleName?: string) => void;
}