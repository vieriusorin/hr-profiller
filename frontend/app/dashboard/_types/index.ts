import type { ReactNode } from 'react';
import { Opportunity, OpportunityFilters, CreateOpportunityForm } from '../../../lib/types';
import { UpdateRole } from '../../../lib/api-client';
import { ViewMode, ViewToggleProps } from '../../../components/opportunities/components/view-toggle/types';

export type CreateDialogsProps = {
  showNewOpportunityDialog: boolean;
  showNewRoleDialog: boolean;
  handleCreateOpportunity: (opportunity: CreateOpportunityForm) => Promise<Opportunity>;
  handleCreateRole: (role: UpdateRole) => Promise<void>;
  closeNewOpportunityDialog: () => void;
  closeNewRoleDialogAndReset: () => void;
  children?: ReactNode;
}

export type DashboardActionsProps = ViewToggleProps & {
  onNewOpportunity: () => void;
}

export type DashboardTitleProps = {
  isRefetching?: boolean;
}

export type OpportunityTabsProps = {
  currentView: ViewMode;
  opportunities: Opportunity[];
  onHoldOpportunities: Opportunity[];
  completedOpportunities: Opportunity[];
  filterOpportunities: (opportunities: Opportunity[], filters: OpportunityFilters) => Opportunity[];
  filters: OpportunityFilters;
  handleAddRole: (opportunityId: string) => void;
  handleUpdateRole: (opportunityId: string, roleId: string, status: string) => Promise<void>;
  handleMoveToHold: (opportunityId: string) => Promise<void>;
  handleMoveToInProgress: (opportunityId: string) => Promise<void>;
  handleMoveToCompleted: (opportunityId: string) => Promise<void>;
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

export type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}
