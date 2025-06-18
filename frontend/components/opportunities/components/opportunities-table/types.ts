import type {
  Opportunity as OpportunityType,
} from "@/app/shared/types";
import type { OpportunityActionCallbacks } from "../../types";
import { Employee } from "@/shared/types/employees";
import { Opportunity, UrgencyConfig } from "@/shared/types";

export type ListType = "in-progress" | "on-hold" | "completed";

export interface FlattenedRow {
  opportunityId: string;
  opportunityName: string;
  clientName: string;
  expectedStartDate: string;
  probability: number;
  opportunityStatus: string;
  rolesCount: number;
  hasHiringNeeds: boolean;
  comment?: string;
  roleId?: string;
  roleName?: string;
  requiredGrade?: string;
  roleStatus?: string;
  assignedMemberIds?: string[];
  newHireName?: string;
  needsHire?: boolean;
  allocation?: number;
  isFirstRowForOpportunity: boolean;
  isOpportunityRow: boolean;
  isRoleRow?: boolean;
  rowSpan: number;
}

export interface OpportunitiesTableProps extends OpportunityActionCallbacks {
  opportunities: Opportunity[];
  showActions?: boolean;
  caption?: string;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export interface OpportunityRowProps {
  row: FlattenedRow;
  urgencyConfig: UrgencyConfig;
  tooltip: string;
  showActions?: boolean;
  fullOpportunity: Opportunity | undefined;
  onAddRole: (opportunityId: string) => void;
  onMoveToHold: (opportunityId: string) => void;
  onMoveToInProgress: (opportunityId: string) => void;
  onMoveToCompleted: (opportunityId: string) => void;
}

export interface RoleRowProps {
  row: FlattenedRow;
  urgencyConfig: UrgencyConfig;
  showActions?: boolean;
  fullOpportunity: OpportunityType | undefined;
  employees: Employee[];
  onUpdateRole: (
    opportunityId: string,
    roleId: string,
    updates: string
  ) => void;
}

export type RoleActionsProps = {
  roleId: string;
  opportunityId: string;
  roleName?: string;
  roleStatus: "Open" | "Won" | "Staffed" | "Lost";
  onStatusClick: (
    opportunityId: string,
    roleId: string,
    status: "Won" | "Staffed" | "Lost",
    roleName?: string
  ) => void;
};

export type ConfirmationDialogState = {
  isOpen: boolean;
  status: 'Won' | 'Staffed' | 'Lost';
  opportunityId: string;
  roleId: string;
  roleName?: string;
}