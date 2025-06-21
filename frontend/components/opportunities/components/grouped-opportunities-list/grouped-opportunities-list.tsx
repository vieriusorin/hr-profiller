"use client";

import React, { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { OpportunityCard } from "../opportunity-card/opportunity-card";
import { MonthHeader } from "../month-header/month-header";
import { OpportunitiesListProps } from "../../types";
import { groupOpportunitiesByMonth } from "@/shared/lib/helpers/date-grouping";
import { OpportunityCardSkeleton } from "../opportunity-card/opportunity-card-skeleton";
import { useOpportunityFilters } from "../../hooks/useOpportunityFilters";
import { Opportunity } from "@/lib/types";
import { filterOpportunitiesWithMatchingRoles } from "../../utils/opportunity-filtering";

export const GroupedOpportunitiesList = ({
	status,
	opportunities,
	onAddRole,
	onUpdateRole,
	onMoveToHold,
	onMoveToInProgress,
	onMoveToCompleted,
	onEditOpportunity,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
}: OpportunitiesListProps) => {
	const { filters } = useOpportunityFilters();

	// Filter opportunities to only show those with matching roles
	const filteredOpportunities = useMemo(() => {
		return filterOpportunitiesWithMatchingRoles(opportunities, filters);
	}, [opportunities, filters]);

	const monthGroups = groupOpportunitiesByMonth(filteredOpportunities);

	const { ref, inView } = useInView({
		threshold: 0,
		triggerOnce: false,
	});

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (opportunities.length === 0 && !isFetchingNextPage) {
		const emptyMessage =
			status === "in-progress"
				? "No opportunities in progress"
				: status === "on-hold"
				? "No opportunities on hold"
				: "No completed opportunities";

		return <div className='text-center py-8 text-gray-500'>{emptyMessage}</div>;
	}

	// Show filtered empty state
	if (
		filteredOpportunities.length === 0 &&
		opportunities.length > 0 &&
		!isFetchingNextPage
	) {
		const hasRoleFilters =
			(filters.grades && filters.grades.length > 0) ||
			(filters.needsHire && filters.needsHire !== "all");

		if (hasRoleFilters) {
			return (
				<div className='text-center py-8 text-gray-500'>
					<p>No opportunities match the current role filters</p>
					<p className='text-sm mt-2'>
						Total opportunities: {opportunities.length}
					</p>
				</div>
			);
		}
	}

	return (
		<div className='relative'>
			{monthGroups.map((monthGroup) => (
				<div
					key={monthGroup.monthKey}
					className='relative'
					data-month-group={monthGroup.monthKey}
				>
					<MonthHeader
						monthLabel={monthGroup.monthLabel}
						opportunityCount={monthGroup.opportunities.length}
					/>
					<div className='space-y-4 px-2'>
						{monthGroup.opportunities.map((opportunity: Opportunity) => (
							<OpportunityCard
								key={`${monthGroup.monthKey}-${opportunity.id}`}
								opportunity={opportunity}
								onAddRole={onAddRole}
								onUpdateRole={onUpdateRole}
								onMoveToHold={onMoveToHold}
								onMoveToInProgress={onMoveToInProgress}
								onMoveToCompleted={onMoveToCompleted}
								showActions={status !== "completed"}
								onEditOpportunity={onEditOpportunity}
							/>
						))}
					</div>
				</div>
			))}
			<div ref={ref} className='h-1' />
			{isFetchingNextPage && (
				<div className='flex justify-center items-center p-4'>
					<OpportunityCardSkeleton />
				</div>
			)}
			{!hasNextPage && filteredOpportunities.length > 0 && (
				<div className='text-center py-8 text-gray-500'>
					No more opportunities to load.
				</div>
			)}
		</div>
	);
};
