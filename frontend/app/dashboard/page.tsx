"use client";

import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { RoleForm } from "@/components/opportunities/components/forms/create-role-form";
import { OpportunityFilters } from "@/components/opportunities/components/filters/opportunity-filters";
import { QuickStatsCard } from "@/shared/components/quick-stats-card";
import { useDashboard } from "@/app/hooks/useDashboard";
import { useOpportunityView } from "@/components/opportunities/hooks/useOpportunityView";
import { useDynamicLayout } from "@/components/opportunities/hooks/useDynamicLayout";
import {
	DashboardHeader,
	DashboardTitle,
	DashboardActions,
	OpportunityTabs,
} from "./_components";
import { CreateOpportunityForm } from "@/components/opportunities/components/forms/create-opportunity-form";
import { CollapsibleSection } from "./_components/collapsible-section";
import { TrendingUp, Filter } from "lucide-react";

export default function OpportunityDashboard() {
	const { currentView, setCurrentView } = useOpportunityView();
	const { containerClassName, isGanttView } = useDynamicLayout(currentView);
	const {
		isRefetching,
		showNewOpportunityDialog,
		showNewRoleDialog,
		opportunities,
		onHoldOpportunities,
		completedOpportunities,
		filterOpportunities,
		filters,
		handleCreateRole,
		handleCreateOpportunity,
		openNewOpportunityDialog,
		closeNewOpportunityDialog,
		closeNewRoleDialogAndReset,
		handleAddRole,
		handleUpdateRole,
		handleMoveToHold,
		handleMoveToInProgress,
		handleMoveToCompleted,
		fetchNextPageInProgress,
		hasNextPageInProgress,
		isFetchingNextPageInProgress,
		fetchNextPageOnHold,
		hasNextPageOnHold,
		isFetchingNextPageOnHold,
		fetchNextPageCompleted,
		hasNextPageCompleted,
		isFetchingNextPageCompleted,
	} = useDashboard();

	return (
		<>
			<DashboardHeader />

			<div 
				className={containerClassName}
				style={isGanttView ? { maxWidth: '100%', overflowX: 'hidden' } : {}}
			>
				<div className='flex justify-between items-center mb-6'>
					<DashboardTitle isRefetching={isRefetching} />

					<div className='flex items-center gap-4'>
						<DashboardActions
							currentView={currentView}
							onViewChange={setCurrentView}
							onNewOpportunity={openNewOpportunityDialog}
						/>
					</div>
				</div>

				<CollapsibleSection
					title='Quick Stats'
					icon={<TrendingUp className='h-5 w-5' />}
				>
					<QuickStatsCard
						opportunities={opportunities}
						onHoldOpportunities={onHoldOpportunities}
						completedOpportunities={completedOpportunities}
					/>
				</CollapsibleSection>

				<CollapsibleSection
					title='Filters'
					icon={<Filter className='h-5 w-5' />}
				>
					<OpportunityFilters />
				</CollapsibleSection>

				<OpportunityTabs
					currentView={currentView}
					opportunities={opportunities}
					onHoldOpportunities={onHoldOpportunities}
					completedOpportunities={completedOpportunities}
					filterOpportunities={filterOpportunities}
					filters={filters}
					handleAddRole={handleAddRole}
					handleUpdateRole={handleUpdateRole}
					handleMoveToHold={handleMoveToHold}
					handleMoveToInProgress={handleMoveToInProgress}
					handleMoveToCompleted={handleMoveToCompleted}
					fetchNextPageInProgress={fetchNextPageInProgress}
					hasNextPageInProgress={hasNextPageInProgress}
					isFetchingNextPageInProgress={isFetchingNextPageInProgress}
					fetchNextPageOnHold={fetchNextPageOnHold}
					hasNextPageOnHold={hasNextPageOnHold}
					isFetchingNextPageOnHold={isFetchingNextPageOnHold}
					fetchNextPageCompleted={fetchNextPageCompleted}
					hasNextPageCompleted={hasNextPageCompleted}
					isFetchingNextPageCompleted={isFetchingNextPageCompleted}
				/>

				<Dialog
					open={showNewOpportunityDialog}
					onOpenChange={closeNewOpportunityDialog}
				>
					<DialogTrigger asChild>
						<div style={{ display: "none" }} />
					</DialogTrigger>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Create New Opportunity</DialogTitle>
							<DialogDescription>
								Add a new opportunity to track progress and manage roles.
							</DialogDescription>
						</DialogHeader>
						<CreateOpportunityForm
							onSubmit={handleCreateOpportunity}
							onCancel={closeNewOpportunityDialog}
						/>
					</DialogContent>
				</Dialog>

				<Dialog
					open={showNewRoleDialog}
					onOpenChange={closeNewRoleDialogAndReset}
				>
					<DialogContent className='sm:max-w-[425px]'>
						<DialogHeader>
							<DialogTitle>Add New Role</DialogTitle>
							<DialogDescription>
								Add a new role to the selected opportunity.
							</DialogDescription>
						</DialogHeader>
						<RoleForm
							onSubmit={handleCreateRole}
							onCancel={closeNewRoleDialogAndReset}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
}
