import { TableRow, TableCell } from "@/components/ui/table";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ProbabilityBadge } from "@/shared/components/probability-badge";
import { Building, Calendar, Users } from "lucide-react";
import { EditOpportunityModal } from "../../modals/edit-role-modal";
import { OpportunityRowProps } from "./types";
import { useOpportunityRow } from "../hooks/use-opportunity-row";
import { OpportunityActions } from "./opportunity-actions";

export const OpportunityRow = ({
	row,
	urgencyConfig,
	tooltip,
	showActions,
	fullOpportunity,
	onAddRole,
	onMoveToHold,
	onMoveToInProgress,
	onMoveToCompleted,
}: OpportunityRowProps) => {
	const {
		isEditOpportunityModalOpen,
		handleEditOpportunity,
		handleCloseEditModal,
	} = useOpportunityRow(row);

	return (
		<>
			<TableRow
				className={`${urgencyConfig.bgClass} transition-colors duration-200`}
				title={tooltip}
			>
				<TableCell rowSpan={row.rowSpan} className='font-medium align-top'>
					<div>
						<div
							className='font-semibold underline decoration-dotted underline-offset-4 cursor-pointer'
							onClick={handleEditOpportunity}
						>
							{row.opportunityName}
						</div>
					</div>
				</TableCell>
				<TableCell rowSpan={row.rowSpan} className='align-top'>
					<div className='flex items-center gap-1'>
						<Building className='h-3 w-3' />
						{row.clientName}
					</div>
				</TableCell>
				<TableCell rowSpan={row.rowSpan} className='align-top'>
					<div className='flex flex-col gap-1'>
						<div className='flex items-center gap-1'>
							<Calendar className='h-3 w-3' />
							<span
								className={`font-medium ${urgencyConfig.textClass}`}
								title={tooltip}
							>
								{row.expectedStartDate}
							</span>
						</div>
						{/* <CountdownBadge startDate={row.expectedStartDate} size='sm' /> */}
					</div>
				</TableCell>
				<TableCell rowSpan={row.rowSpan} className='align-top'>
					<ProbabilityBadge probability={row.probability} size='sm' />
				</TableCell>

				{/* This cell is for the first role's comment */}
				<TableCell className='w-[180px] max-w-[180px] truncate'>
					{row.comment ? (
						row.comment.length > 30 ? (
							<Popover>
								<PopoverTrigger asChild>
									<span className='cursor-pointer underline'>
										{row.comment.slice(0, 30)}...{" "}
										<span className='text-xs'>(more)</span>
									</span>
								</PopoverTrigger>
								<PopoverContent className='max-w-xs whitespace-pre-wrap'>
									{row.comment}
								</PopoverContent>
							</Popover>
						) : (
							<span>{row.comment}</span>
						)
					) : (
						<span className='text-muted-foreground italic'>—</span>
					)}
				</TableCell>

				<TableCell className='text-muted-foreground italic text-center'>
					{row.isFirstRowForOpportunity && (
						<span className='flex items-center gap-1 text-xs text-muted-foreground'>
							<Users className='h-3 w-3' />
							{row.rolesCount} role{row.rolesCount !== 1 ? "s" : ""}
						</span>
					)}
				</TableCell>

				{/* Placeholder cells for role-specific columns */}
				<TableCell className='text-muted-foreground italic text-center'>
					—
				</TableCell>
				<TableCell className='text-muted-foreground italic text-center'>
					—
				</TableCell>
				<TableCell className='text-muted-foreground italic text-center'>
					—
				</TableCell>
				<TableCell className='text-muted-foreground italic text-center'>
					—
				</TableCell>

				<TableCell className='text-muted-foreground italic text-center'>
					—
				</TableCell>

				{/* Role Actions - empty for opportunity row */}
				{showActions && (
					<TableCell className='text-muted-foreground italic text-center'>
						—
					</TableCell>
				)}

				{/* Opportunity Actions */}
				{showActions && (
					<TableCell rowSpan={row.rowSpan} className='align-top'>
						<OpportunityActions
							opportunityId={row.opportunityId}
							opportunityStatus={row.opportunityStatus}
							onAddRole={onAddRole}
							onMoveToHold={onMoveToHold}
							onMoveToInProgress={onMoveToInProgress}
							onMoveToCompleted={onMoveToCompleted}
						/>
					</TableCell>
				)}
			</TableRow>

			{fullOpportunity && (
				<EditOpportunityModal
					isOpen={isEditOpportunityModalOpen}
					onClose={handleCloseEditModal}
					opportunity={fullOpportunity}
					listType={
						fullOpportunity.status === "In Progress"
							? "in-progress"
							: fullOpportunity.status === "On Hold"
							? "on-hold"
							: "completed"
					}
				/>
			)}
		</>
	);
};
