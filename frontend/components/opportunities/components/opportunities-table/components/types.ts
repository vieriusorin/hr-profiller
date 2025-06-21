import { FlattenedRow } from "../types";
import { Opportunity, RoleStatus, UrgencyConfig } from '@/lib/types';
import { Employee } from '@/lib/types';
import { OpportunityActionCallbacks } from "../../../types";

export interface OpportunitiesTableRowProps extends OpportunityActionCallbacks {
  row: FlattenedRow;
  showActions: boolean;
}

export type OpportunityRowProps = {
  row: FlattenedRow;
  urgencyConfig: UrgencyConfig;
  tooltip: string;
  showActions: boolean;
  fullOpportunity?: Opportunity;
  onAddRole: (opportunityId: string) => void;
  onMoveToHold: (opportunityId: string) => void;
  onMoveToInProgress: (opportunityId: string) => void;
  onMoveToCompleted: (opportunityId: string) => void;
}

export type RoleRowProps = {
  row: FlattenedRow;
  urgencyConfig: UrgencyConfig;
  showActions: boolean;
  fullOpportunity?: Opportunity;
  employees: Employee[];
  onUpdateRole: (
    opportunityId: string,
    roleId: string,
    status: RoleStatus
  ) => void;
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

export type OpportunitiesTableHeaderProps = {
	showActions?: boolean;
	className?: string;
}
