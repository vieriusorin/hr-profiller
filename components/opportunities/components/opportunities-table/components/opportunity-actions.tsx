import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface OpportunityActionsProps {
	opportunityId: string;
	opportunityStatus: string;
	onAddRole: (opportunityId: string) => void;
	onMoveToHold: (opportunityId: string) => void;
	onMoveToInProgress: (opportunityId: string) => void;
	onMoveToCompleted: (opportunityId: string) => void;
}

export const OpportunityActions = ({
	opportunityId,
	opportunityStatus,
	onAddRole,
	onMoveToHold,
	onMoveToInProgress,
	onMoveToCompleted,
}: OpportunityActionsProps) => {
	return (
		<div className='flex gap-1 min-w-0'>
			<Button
				size='sm'
				variant='outline'
				onClick={() => onAddRole(opportunityId)}
				className='text-xs h-6'
			>
				<Plus className='h-3 w-3 mr-1' />
				Add Role
			</Button>
			{opportunityStatus === "In Progress" && (
				<Button
					size='sm'
					variant='secondary'
					onClick={() => onMoveToHold(opportunityId)}
					className='text-xs h-6'
				>
					Hold
				</Button>
			)}
			{opportunityStatus === "On Hold" && (
				<Button
					size='sm'
					variant='default'
					onClick={() => onMoveToInProgress(opportunityId)}
					className='text-xs h-6'
				>
					Resume
				</Button>
			)}
			{(opportunityStatus === "In Progress" ||
				opportunityStatus === "On Hold") && (
				<Button
					size='sm'
					variant='default'
					onClick={() => onMoveToCompleted(opportunityId)}
					className='text-xs h-6'
				>
					Complete
				</Button>
			)}
		</div>
	);
};
