import { Opportunity } from '@/shared/types';

export interface OpportunityActions {
  onAddRole?: (opportunityId: number) => void;
  onMoveToHold?: (opportunityId: number) => void;
  onMoveToInProgress?: (opportunityId: number) => void;
}

export interface OpportunityCardProps extends OpportunityActions {
  opportunity: Opportunity;
  showActions?: boolean;
  onUpdateRole?: (opportunityId: number, roleId: number, status: string) => void;
}

export interface UseOpportunityCardProps extends OpportunityActions {
  opportunityId: number;
}

export interface UseOpportunityCardReturn {
  isExpanded: boolean;
  toggleExpanded: () => void;
  handleAddRole: () => void;
  handleMoveToHold: () => void;
  handleMoveToInProgress: () => void;
} 