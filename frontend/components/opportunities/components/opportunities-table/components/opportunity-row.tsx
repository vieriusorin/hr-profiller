import { TableRow, TableCell } from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ProbabilityBadge } from "@/shared/components/probability-badge";
import { Building, Users, MessageSquare } from "lucide-react";
import { EditOpportunityModal } from "../../modals/edit-role-modal";
import { OpportunityRowProps } from "./types";
import { useOpportunityRow } from "../hooks/use-opportunity-row";
import { OpportunityActions } from "./opportunity-actions";
import { format } from "date-fns";

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
				<TableCell rowSpan={row.rowSpan} className='font-medium align-top w-[160px] max-w-[160px]'>
					<div>
						<div
							className='font-semibold underline decoration-dotted underline-offset-4 cursor-pointer truncate'
							onClick={handleEditOpportunity}
							title={row.opportunityName}
						>
							{row.opportunityName}
						</div>
					</div>
				</TableCell>
				<TableCell rowSpan={row.rowSpan} className='align-top w-[140px] max-w-[140px]'>
					<div className='flex items-center gap-1' title={row.clientName}>
						<Building className='h-3 w-3 flex-shrink-0' />
						<span className='truncate'>{row.clientName}</span>
					</div>
				</TableCell>
				<TableCell rowSpan={row.rowSpan} className='align-top'>
					<div className='flex flex-col gap-1'>
						<div className='flex items-center gap-1'>
							<span
								className={`font-medium ${urgencyConfig.textClass}`}
								title={tooltip}
							>
								{format(row.expectedStartDate, "MMM/dd/yyyy")}	
							</span>
						</div>
					</div>
				</TableCell>
				<TableCell rowSpan={row.rowSpan} className='align-top'>
					<ProbabilityBadge probability={row.probability} size='sm' />
				</TableCell>

				{/* This cell is for the first role's comment */}
				<TableCell className='w-[60px] max-w-[60px]'>
					{row.comment ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='ghost'
									size='sm'
									className='h-7 px-2 text-xs'
								>
									<MessageSquare className='h-3 w-3 mr-1' />
								</Button>
							</TooltipTrigger>
							<TooltipContent className='max-w-xs whitespace-pre-wrap'>
								{row.comment}
							</TooltipContent>
						</Tooltip>
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
				<TableCell className='text-muted-foreground italic text-center' />
				<TableCell className='text-muted-foreground italic text-center' />
				<TableCell className='text-muted-foreground italic text-center' />
				<TableCell className='text-muted-foreground italic text-center' />
				<TableCell className='text-muted-foreground italic text-center' />

				{/* Role Actions - empty for opportunity row */}
				{showActions && (
					<TableCell className='text-muted-foreground italic text-center' />
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
