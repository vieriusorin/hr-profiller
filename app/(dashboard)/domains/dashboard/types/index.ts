import type { ReactNode } from 'react';
import { ViewMode } from '@/app/(dashboard)/domains/opportunities/components/view-toggle/types';
import { CreateOpportunityForm, CreateRoleForm, Opportunity, OpportunityFilters, Role } from '@/app/shared/types';

export interface CreateDialogsProps {
  showNewOpportunityDialog: boolean;
  showNewRoleDialog: boolean;
  handleCreateOpportunity: (data: CreateOpportunityForm) => void;
  handleCreateRole: (data: CreateRoleForm) => void;
  closeNewOpportunityDialog: () => void;
  closeNewRoleDialogAndReset: () => void;
  children?: ReactNode;
}

export interface DashboardActionsProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    onNewOpportunity: () => void;
  }

export interface DashboardTitleProps {
    isRefetching?: boolean;
}

export interface OpportunityTabsProps {
    currentView: ViewMode;
    opportunities: Opportunity[];
    onHoldOpportunities: Opportunity[];
    completedOpportunities: Opportunity[];
    filterOpportunities: (opportunities: Opportunity[], filters: OpportunityFilters) => Opportunity[];
    filters: OpportunityFilters;
    handleAddRole: (opportunityId: string) => void;
    handleUpdateRole: (opportunityId: string, roleId: string, updates: Role) => void;
    handleMoveToHold: (opportunityId: string) => void;
    handleMoveToInProgress: (opportunityId: string) => void;
    handleMoveToCompleted: (opportunityId: string) => void;
  }