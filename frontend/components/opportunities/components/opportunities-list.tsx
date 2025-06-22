"use client";

import React from "react";
import { OpportunitiesListProps } from "../types";
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
	const opportunitiesToShow = (() => {
		switch (status) {
			case "in-progress":
				return opportunities;
			case "on-hold":
				return onHoldOpportunities;
			case "completed":
				return completedOpportunities;
			default:
				return [];
		}
	})();

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
