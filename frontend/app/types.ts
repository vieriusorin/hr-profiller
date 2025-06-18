import { Opportunity, OpportunityFilters, CreateRoleForm } from '@/shared/types';
import { ReactNode } from 'react';

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

export type ProvidersProps = {
  children: ReactNode;
}


export type GanttSettings = {
	highProbability: {
		backgroundColor: string;
		backgroundSelectedColor: string;
		progressColor: string;
		progressSelectedColor: string;
	};
	mediumProbability: {
		backgroundColor: string;
		backgroundSelectedColor: string;
		progressColor: string;
		progressSelectedColor: string;
	};
	lowProbability: {
		backgroundColor: string;
		backgroundSelectedColor: string;
		progressColor: string;
		progressSelectedColor: string;
	};
	role: {
		progressColor: string;
		progressSelectedColor: string;
	};
	todayColor: string;
	arrowColor: string;
};

export type Settings = {
	primaryColor: string;
	logoUrl: string;
	logoWidth: number;
	logoHeight: number;
	logoAlt: string;
	background: string;
	foreground: string;
	card: string;
	cardForeground: string;
	secondary: string;
	accent: string;
	destructive: string;
	border: string;
	input: string;
	radius: string;
	primaryForeground: string;
	gantt?: GanttSettings;
};

export type ThemeContextType = {
	settings: Settings;
	setSettings: (settings: Partial<Settings>) => void;
	isLoading: boolean;
};