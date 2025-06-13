import { Opportunity, OpportunityFilters, CreateRoleForm } from '@/shared/types';

export interface UseDashboardReturn {
  opportunities: Opportunity[];
  onHoldOpportunities: Opportunity[];
  completedOpportunities: Opportunity[];
  loading: boolean;
  error: unknown;
  isRefetching: boolean;
  isAddingRole: boolean;
  filters: OpportunityFilters;
  showNewOpportunityDialog: boolean;
  showNewRoleDialog: boolean;
  selectedOpportunityId: string | null;
  filterOpportunities: (opportunities: Opportunity[], filters: OpportunityFilters) => Opportunity[];
  handleAddRole: (opportunityId: string) => void;
  handleCreateRole: (roleData: CreateRoleForm) => Promise<void>;
  handleUpdateRole: (opportunityId: string, roleId: string, status: string) => Promise<void>;
  handleCreateOpportunity: (opportunity: Opportunity) => Promise<Opportunity>;
  handleMoveToHold: (opportunityId: string) => Promise<void>;
  handleMoveToInProgress: (opportunityId: string) => Promise<void>;
  handleMoveToCompleted: (opportunityId: string) => Promise<void>;
  openNewOpportunityDialog: () => void;
  closeNewOpportunityDialog: () => void;
  closeNewRoleDialog: () => void;
  closeNewRoleDialogAndReset: () => void;
} 
