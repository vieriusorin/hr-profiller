"use client";

import React from "react";
import { OpportunitiesListProps } from "../types";
import { Opportunity } from "@/shared/types";
import OpportunitiesTable from "./opportunities-table/opportunities-table";
import { GroupedOpportunitiesList } from "./grouped-opportunities-list";

const OpportunitiesList: React.FC<OpportunitiesListProps> = ({
	viewMode,
	status,
	opportunities,
	onHoldOpportunities,
	completedOpportunities,
	filterOpportunities,
	filters,
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
	let opportunitiesToShow: Opportunity[] = [];

	switch (status) {
		case "in-progress":
			opportunitiesToShow = filterOpportunities(opportunities, filters);
			break;
		case "on-hold":
			opportunitiesToShow = filterOpportunities(onHoldOpportunities, filters);
			break;
		case "completed":
			opportunitiesToShow = filterOpportunities(
				completedOpportunities,
				filters
			);
			break;
	}

	return (
		<>
			{viewMode === "cards" ? (
				<GroupedOpportunitiesList
					viewMode={viewMode}
					status={status}
					opportunities={opportunitiesToShow}
					onHoldOpportunities={onHoldOpportunities}
					completedOpportunities={completedOpportunities}
					filterOpportunities={filterOpportunities}
					filters={filters}
					onAddRole={onAddRole}
					onUpdateRole={onUpdateRole}
					onMoveToHold={onMoveToHold}
					onMoveToInProgress={onMoveToInProgress}
					onMoveToCompleted={onMoveToCompleted}
					onEditOpportunity={onEditOpportunity}
					fetchNextPage={fetchNextPage}
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
				/>
			) : (
				<OpportunitiesTable
					opportunities={opportunitiesToShow}
					onAddRole={onAddRole}
					onUpdateRole={onUpdateRole}
					onMoveToHold={onMoveToHold}
					onMoveToInProgress={onMoveToInProgress}
					onMoveToCompleted={onMoveToCompleted}
					showActions={status !== "completed"}
					fetchNextPage={fetchNextPage}
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
				/>
			)}
		</>
	);
};

export default OpportunitiesList;
