import { Opportunity } from '@/lib/api-client';
import type { OpportunityActionCallbacks } from '../../types';

export interface UseOpportunityCardProps extends OpportunityActionCallbacks {
  opportunityId: string;
}

export interface UseOpportunityCardReturn {
  isExpanded: boolean;
  toggleExpanded: () => void;
  handleAddRole: () => void;
  handleMoveToHold: () => void;
  handleMoveToInProgress: () => void;
  handleMoveToCompleted: () => void;
}

export type OpportunityCardProps = {
  opportunity: Opportunity;
  showActions: boolean;
  onUpdateRole?: (opportunityId: string, roleId: string, status: string) => void;
  onAddRole?: (opportunityId: string) => void;
  onEditOpportunity?: (opportunity: Opportunity) => void;
  onMoveToHold?: (opportunityId: string) => void;
  onMoveToCompleted?: (opportunityId: string) => void;
  onMoveToInProgress?: (opportunityId: string) => void;
}

export type TeamSizeIndicatorProps = {
  filledRoles: number;
  totalRoles: number;
}

export type OpportunityCardActionsProps = {
  status: 'In Progress' | 'On Hold' | 'Completed';
  onAddRole: () => void;
  onMoveToHold: () => void;
  onMoveToInProgress: () => void;
  onMoveToCompleted: () => void;
}

export type OpportunityCardDescriptionProps = {
  clientName: string;
  expectedStartDate: string;
  probability: number;
  createdAt?: string;
}

export type OpportunityCardHeaderProps = {
  opportunityName: string;
  status: 'In Progress' | 'On Hold' | 'Completed';
  expectedStartDate: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEditClick: () => void;
  actions?: React.ReactNode;
}

export type OpportunityCardRolesProps = {
  opportunity: Opportunity;
  showActions: boolean;
  onUpdateRole?: (
    opportunityId: string,
    roleId: string,
    status: string
  ) => void;
}