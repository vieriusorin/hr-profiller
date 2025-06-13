
import { Opportunity } from '@/shared/types';
import { ViewMode } from '../components/view-toggle/types';
import { OpportunityFiltersState } from '../hooks/useOpportunityFilters';

export interface OpportunityActionCallbacks {
  onAddRole?: (opportunityId: string) => void;
  onUpdateRole?: (opportunityId: string, roleId: string, status: string) => void;
  onMoveToHold?: (opportunityId: string) => void;
  onMoveToInProgress?: (opportunityId: string) => void;
  onMoveToCompleted?: (opportunityId: string) => void;
}

export interface OpportunityActionCallbacksAsync {
  handleAddRole?: (opportunityId: string) => void;
  handleUpdateRole?: (opportunityId: string, roleId: string, status: string) => Promise<void>;
  handleMoveToHold?: (opportunityId: string) => Promise<void>;
  handleMoveToInProgress?: (opportunityId: string) => Promise<void>;
  handleMoveToCompleted?: (opportunityId: string) => Promise<void>;
} 

export interface OpportunitiesListProps extends OpportunityActionCallbacks {
  viewMode: ViewMode;
  status: 'in-progress' | 'on-hold' | 'completed';
  opportunities: Opportunity[];
  onHoldOpportunities: Opportunity[];
  completedOpportunities: Opportunity[];
  filterOpportunities: (opportunities: Opportunity[], filters: OpportunityFiltersState) => Opportunity[];
  filters: OpportunityFiltersState;
  onEditOpportunity?: (opportunity: Opportunity) => void;
}