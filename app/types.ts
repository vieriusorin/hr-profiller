import { Opportunity, OpportunityFilters } from '@/shared/types';

export interface UseDashboardReturn {
  opportunities: Opportunity[];
  onHoldOpportunities: Opportunity[];
  completedOpportunities: Opportunity[];
  loading: boolean;
  error: any;
  isRefetching: boolean;
  filters: OpportunityFilters;
  showNewOpportunityDialog: boolean;
  showNewRoleDialog: boolean;
  selectedOpportunityId: number | null;
  filterOpportunities: (opportunities: Opportunity[], filters: OpportunityFilters) => Opportunity[];
  handleAddRole: (opportunityId: number) => void;
  handleCreateRole: (roleData: any) => Promise<void>;
  handleUpdateRole: (opportunityId: number, roleId: number, status: string) => Promise<void>;
  handleCreateOpportunity: (opportunity: any) => Promise<any>;
  handleMoveToHold: (opportunityId: number) => Promise<void>;
  handleMoveToInProgress: (opportunityId: number) => Promise<void>;
  openNewOpportunityDialog: () => void;
  closeNewOpportunityDialog: () => void;
  closeNewRoleDialog: () => void;
  closeNewRoleDialogAndReset: () => void;
} 