import { Opportunity, OpportunityFilters, CreateRoleForm } from '@/shared/types';
import { ReactNode } from 'react';
import { DehydratedState } from '@tanstack/react-query';

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
  fetchNextPageInProgress: () => void;
  hasNextPageInProgress: boolean;
  isFetchingNextPageInProgress: boolean;
  fetchNextPageOnHold: () => void;
  hasNextPageOnHold: boolean;
  isFetchingNextPageOnHold: boolean;
  fetchNextPageCompleted: () => void;
  hasNextPageCompleted: boolean;
  isFetchingNextPageCompleted: boolean;
}

export interface ProvidersProps {
  children: React.ReactNode;
}