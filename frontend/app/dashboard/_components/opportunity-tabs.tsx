import { Suspense, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Calendar, Users } from "lucide-react";
import { OpportunityTabsProps } from "../_types";
import { OpportunityCardSkeleton } from "@/components/opportunities/components/opportunity-card/opportunity-card-skeleton";
import OpportunitiesList from "@/components/opportunities/components/opportunities-list";
import { GanttChartWrapper } from "@/components/gantt/gantt-chart-wrapper";
import { withErrorBoundary } from "@/app/shared/components/with-error-boundary";
import { OpportunitiesErrorFallback } from "@/app/shared/components/error-fallbacks/opportunities-error-fallback";
import { useOpportunityFilters } from "@/components/opportunities/hooks/useOpportunityFilters";
import { filterOpportunitiesWithMatchingRoles } from "@/components/opportunities/utils/opportunity-filtering";

// Create error boundary wrapped versions of our content components
const ErrorBoundaryWrappedContent = withErrorBoundary(
	({ children }: { children: React.ReactNode }) => <>{children}</>,
	{ FallbackComponent: OpportunitiesErrorFallback }
);

const ErrorBoundaryWrappedGantt = withErrorBoundary(GanttChartWrapper, {
	FallbackComponent: OpportunitiesErrorFallback,
});

export const OpportunityTabs = ({
	currentView,
	opportunities,
	onHoldOpportunities,
	completedOpportunities,
	filterOpportunities,
	filters,
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
}: OpportunityTabsProps) => {
	const { filters: currentFilters } = useOpportunityFilters();

	const allOpportunities = useMemo(() => {
		return [
			...opportunities,
			...onHoldOpportunities,
			...completedOpportunities,
		];
	}, [opportunities, onHoldOpportunities, completedOpportunities]);

	// Calculate filtered counts using role-based filtering logic
	const filteredInProgress = useMemo(() => {
		return filterOpportunitiesWithMatchingRoles(opportunities, currentFilters);
	}, [opportunities, currentFilters]);

	const filteredOnHold = useMemo(() => {
		return filterOpportunitiesWithMatchingRoles(
			onHoldOpportunities,
			currentFilters
		);
	}, [onHoldOpportunities, currentFilters]);

	const filteredCompleted = useMemo(() => {
		return filterOpportunitiesWithMatchingRoles(
			completedOpportunities,
			currentFilters
		);
	}, [completedOpportunities, currentFilters]);

	if (currentView === "gantt") {
		return <ErrorBoundaryWrappedGantt opportunities={allOpportunities} />;
	}

	return (
		<Tabs defaultValue='in-progress' className='w-full'>
			<TabsList className='grid w-full grid-cols-3'>
				<TabsTrigger value='in-progress' className='flex items-center gap-2'>
					<Building className='h-4 w-4' />
					In Progress
					{filteredInProgress.length > 0 && (
						<span className='ml-2 rounded-full bg-primary/30 px-2 py-0.5 text-xs text-black'>
							{filteredInProgress.length}
						</span>
					)}
				</TabsTrigger>
				<TabsTrigger value='on-hold' className='flex items-center gap-2'>
					<Calendar className='h-4 w-4' />
					On Hold
					{filteredOnHold.length > 0 && (
						<span className='ml-2 rounded-full bg-primary/30 px-2 py-0.5 text-xs text-black'>
							{filteredOnHold.length}
						</span>
					)}
				</TabsTrigger>
				<TabsTrigger value='completed' className='flex items-center gap-2'>
					<Users className='h-4 w-4' />
					Completed
					{filteredCompleted.length > 0 && (
						<span className='ml-2 rounded-full bg-primary/30 px-2 py-0.5 text-xs text-black'>
							{filteredCompleted.length}
						</span>
					)}
				</TabsTrigger>
			</TabsList>

			<Suspense fallback={<OpportunityCardSkeleton />}>
				<TabsContent value='in-progress'>
					<ErrorBoundaryWrappedContent>
						<OpportunitiesList
							viewMode={currentView}
							status='in-progress'
							opportunities={opportunities}
							onHoldOpportunities={onHoldOpportunities}
							completedOpportunities={completedOpportunities}
							filterOpportunities={filterOpportunities}
							filters={filters}
							onAddRole={handleAddRole}
							onUpdateRole={handleUpdateRole}
							onMoveToHold={handleMoveToHold}
							onMoveToInProgress={handleMoveToInProgress}
							onMoveToCompleted={handleMoveToCompleted}
							fetchNextPage={fetchNextPageInProgress}
							hasNextPage={hasNextPageInProgress}
							isFetchingNextPage={isFetchingNextPageInProgress}
						/>
					</ErrorBoundaryWrappedContent>
				</TabsContent>

				<TabsContent value='on-hold'>
					<ErrorBoundaryWrappedContent>
						<OpportunitiesList
							viewMode={currentView}
							status='on-hold'
							opportunities={opportunities}
							onHoldOpportunities={onHoldOpportunities}
							completedOpportunities={completedOpportunities}
							filterOpportunities={filterOpportunities}
							filters={filters}
							onMoveToInProgress={handleMoveToInProgress}
							onAddRole={handleAddRole}
							onUpdateRole={handleUpdateRole}
							onMoveToHold={undefined}
							onMoveToCompleted={handleMoveToCompleted}
							fetchNextPage={fetchNextPageOnHold}
							hasNextPage={hasNextPageOnHold}
							isFetchingNextPage={isFetchingNextPageOnHold}
						/>
					</ErrorBoundaryWrappedContent>
				</TabsContent>

				<TabsContent value='completed'>
					<ErrorBoundaryWrappedContent>
						<OpportunitiesList
							viewMode={currentView}
							status='completed'
							opportunities={opportunities}
							onHoldOpportunities={onHoldOpportunities}
							completedOpportunities={completedOpportunities}
							filterOpportunities={filterOpportunities}
							filters={filters}
							onAddRole={handleAddRole}
							onUpdateRole={handleUpdateRole}
							onMoveToHold={undefined}
							onMoveToInProgress={undefined}
							fetchNextPage={fetchNextPageCompleted}
							hasNextPage={hasNextPageCompleted}
							isFetchingNextPage={isFetchingNextPageCompleted}
						/>
					</ErrorBoundaryWrappedContent>
				</TabsContent>
			</Suspense>
		</Tabs>
	);
};
