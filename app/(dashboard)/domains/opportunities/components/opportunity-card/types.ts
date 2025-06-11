import { Opportunity } from '@/shared/types';

export interface OpportunityActions {
  onAddRole?: (opportunityId: string) => void;
  onMoveToHold?: (opportunityId: string) => void;
  onMoveToInProgress?: (opportunityId: string) => void;
  onMoveToCompleted?: (opportunityId: string) => void;
}

export interface OpportunityCardProps extends OpportunityActions {
  opportunity: Opportunity;
  showActions?: boolean;
  onUpdateRole?: (opportunityId: string, roleId: string, status: string) => void;
}

export interface UseOpportunityCardProps extends OpportunityActions {
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