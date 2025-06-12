import { Opportunity, OpportunityFilters } from '@/shared/types';
import type { OpportunityActionCallbacksAsync } from './(dashboard)/domains/opportunities/types';

export interface UseDashboardReturn extends OpportunityActionCallbacksAsync {
  opportunities: Opportunity[];
  onHoldOpportunities: Opportunity[];
  completedOpportunities: Opportunity[];
  loading: boolean;
  error: unknown;
  isRefetching: boolean;
  filters: OpportunityFilters;
  showNewOpportunityDialog: boolean;
  showNewRoleDialog: boolean;
  selectedOpportunityId: string | null;
  filterOpportunities: (opportunities: Opportunity[], filters: OpportunityFilters) => Opportunity[];
  handleCreateRole: (roleData: unknown) => Promise<void>;
  handleCreateOpportunity: (opportunity: Opportunity) => Promise<Opportunity>;
  openNewOpportunityDialog: () => void;
  closeNewOpportunityDialog: () => void;
  closeNewRoleDialog: () => void;
  closeNewRoleDialogAndReset: () => void;
} 
