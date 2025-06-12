import { Opportunity } from '@/shared/types';
import type { OpportunityActionCallbacks } from '../../types';

// Legacy alias for backward compatibility
export interface OpportunityActions extends OpportunityActionCallbacks {}

export interface OpportunityCardProps extends OpportunityActionCallbacks {
  opportunity: Opportunity;
  showActions?: boolean;
}

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
