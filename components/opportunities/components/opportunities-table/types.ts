import type {
  Opportunity as OpportunityType,
  OpportunityStatus,
  RoleStatus,
} from "@/app/shared/types";
import type { OpportunityActionCallbacks } from "../../types";
import { Employee } from "@/shared/types/employees";

export type UrgencyConfig = {
  bgClass: string;
  textClass: string;
  icon?: React.ElementType;
};

export type ListType = "in-progress" | "on-hold" | "completed";

export interface OpportunitiesTableProps extends OpportunityActionCallbacks {
  listType: ListType;
  showActions?: boolean;
  caption?: string;
}

export interface FlattenedRow {
  isOpportunityRow: boolean;
  isFirstRowForOpportunity: boolean;
  rowSpan: number;
  opportunityId: string;
  opportunityName: string;
  opportunityStatus: OpportunityStatus;
  clientName: string;
  expectedStartDate: string;
  probability: number;
  rolesCount: number;
  hasHiringNeeds: boolean;
  roleId?: string;
  roleName?: string;
  requiredGrade?: string;
  roleStatus?: RoleStatus;
  assignedMemberIds?: string[];
  allocation?: number;
  needsHire?: boolean;
  newHireName?: string;
  comment?: string;
}

export interface OpportunityRowProps {
  row: FlattenedRow;
  urgencyConfig: UrgencyConfig;
  tooltip: string;
  showActions?: boolean;
  fullOpportunity: OpportunityType | undefined;
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