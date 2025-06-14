"use client";

import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { OpportunityCard } from "../opportunity-card/opportunity-card";
import { MonthHeader } from "../month-header/month-header";
import { OpportunitiesListProps } from "../../types";
import { groupOpportunitiesByMonth } from "@/shared/lib/helpers/date-grouping";
import { OpportunityCardSkeleton } from "../opportunity-card/opportunity-card-skeleton";

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
	const monthGroups = groupOpportunitiesByMonth(opportunities);

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
						{monthGroup.opportunities.map((opportunity) => (
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
			{!hasNextPage && opportunities.length > 0 && (
				<div className='text-center py-8 text-gray-500'>
					No more opportunities to load.
				</div>
			)}
		</div>
	);
};
