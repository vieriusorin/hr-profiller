import React from 'react';
import { useOpportunitiesTableRow } from "../hooks/use-opportunities-table-row";
import { OpportunitiesTableRowProps } from "./types";
import { OpportunityRow } from "./opportunity-row";
import { RoleRow } from "./role-row";
import { withErrorBoundary } from '@/app/shared/components/with-error-boundary';
import { OpportunitiesErrorFallback } from '@/app/shared/components/error-fallbacks/opportunities-error-fallback';

const OpportunitiesTableRow = (props: OpportunitiesTableRowProps) => {
	const {
		row,
		onAddRole,
		onUpdateRole,
		onMoveToHold,
		onMoveToInProgress,
		onMoveToCompleted,
	} = props;

	const {
		handleAddRole,
		handleUpdateRole,
		handleMoveToHold,
		handleMoveToInProgress,
		handleMoveToCompleted,
		fullOpportunity,
		employees,
		urgencyConfig,
		tooltip,
	} = useOpportunitiesTableRow(row, {
		onAddRole,
		onUpdateRole,
		onMoveToHold,
		onMoveToInProgress,
		onMoveToCompleted,
	});

	if (row.isOpportunityRow) {
		return (
			<OpportunityRow
				row={row}
				urgencyConfig={urgencyConfig}
				tooltip={tooltip}
				showActions={props.showActions}
				fullOpportunity={fullOpportunity}
				onAddRole={handleAddRole}
				onMoveToHold={handleMoveToHold}
				onMoveToInProgress={handleMoveToInProgress}
				onMoveToCompleted={handleMoveToCompleted}
			/>
		);
	}

	return (
		<RoleRow
			row={row}
			urgencyConfig={urgencyConfig}
			showActions={props.showActions}
			fullOpportunity={fullOpportunity}
			employees={employees}
			onUpdateRole={handleUpdateRole}
		/>
	);
};

export default withErrorBoundary(OpportunitiesTableRow, {
	FallbackComponent: OpportunitiesErrorFallback
});
