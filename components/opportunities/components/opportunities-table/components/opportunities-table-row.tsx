import { useOpportunitiesTableRow } from "../hooks/use-opportunities-table-row";
import { OpportunitiesTableRowProps } from "./types";
import { OpportunityRow } from "./opportunity-row";
import { RoleRow } from "./role-row";

export const OpportunitiesTableRow = (props: OpportunitiesTableRowProps) => {
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
