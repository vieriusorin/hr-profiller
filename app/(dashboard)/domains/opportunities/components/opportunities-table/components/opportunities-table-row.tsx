import * as React from "react";
import { useState } from 'react';

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/shared/components/status-badge";
import { ProbabilityBadge } from "@/shared/components/probability-badge";
import {
	Building,
	Calendar,
	Plus,
	Users,
	CheckCircle,
	UserCheck,
	XCircle,
	MoreHorizontal,
} from "lucide-react";
import {
	getStartDateUrgency,
	getUrgencyConfig,
	getUrgencyTooltip,
} from "@/shared/lib/helpers/date-urgency";
import type { OpportunitiesTableRowProps } from "./types";
import { useOpportunitiesTableRow } from "./hooks/use-opportunities-table-row";
import { RoleStatusConfirmationDialog } from "../../role-status-confirmation";
import { EditRoleModal } from "../../modals/edit-role-modal";

export const OpportunitiesTableRow = ({
	row,
	showActions,
	onAddRole,
	onUpdateRole,
	onMoveToHold,
	onMoveToInProgress,
	onMoveToCompleted,
}: OpportunitiesTableRowProps) => {
	const [confirmationDialog, setConfirmationDialog] = useState<{
		isOpen: boolean;
		status: 'Won' | 'Staffed' | 'Lost';
		opportunityId: string;
		roleId: string;
		roleName?: string;
	}>({
		isOpen: false,
		status: 'Won',
		opportunityId: '',
		roleId: '',
		roleName: ''
	});

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const {
		handleMoveToHold,
		handleMoveToInProgress,
		handleMoveToCompleted,
		handleAddRole,
		handleUpdateRole,
	} = useOpportunitiesTableRow({
		onMoveToHold,
		onMoveToInProgress,
		onMoveToCompleted,
		onAddRole,
		onUpdateRole,
	});

	const handleStatusClick = (opportunityId: string, roleId: string, status: 'Won' | 'Staffed' | 'Lost', roleName?: string) => {
		setConfirmationDialog({
			isOpen: true,
			status,
			opportunityId,
			roleId,
			roleName
		});
	};

	const handleConfirmStatusUpdate = () => {
		handleUpdateRole(confirmationDialog.opportunityId, confirmationDialog.roleId, confirmationDialog.status);
	};

	const handleCloseDialog = () => {
		setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
	};

	const handleRoleNameClick = () => {
		setIsEditModalOpen(true);
	};

	if (row.isOpportunityRow) {
		return (
			<>
				<TableRow>
					<TableCell rowSpan={row.rowSpan} className='font-medium align-top'>
						<div>
							<div className='font-semibold'>{row.opportunityName}</div>
							<div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'>
								{row.hasHiringNeeds && (
									<Badge variant='outline' className='ml-1 text-xs'>
										Hiring needed
									</Badge>
								)}
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
						<div className='flex items-center gap-1'>
							<Calendar className='h-3 w-3' />
							<span
								className={`${
									getUrgencyConfig(getStartDateUrgency(row.expectedStartDate))
										.textClass
								}`}
								title={getUrgencyTooltip(row.expectedStartDate)}
							>
								{row.expectedStartDate}
							</span>
						</div>
					</TableCell>
					<TableCell rowSpan={row.rowSpan} className='align-top'>
						<ProbabilityBadge probability={row.probability} size='sm' />
					</TableCell>
					<TableCell rowSpan={row.rowSpan} className='align-top'>
						<StatusBadge status={row.opportunityStatus} />
					</TableCell>

					<TableCell className='text-muted-foreground italic text-center'>
						{row.isFirstRowForOpportunity && (
							<span className='flex items-center gap-1 text-xs text-muted-foreground'>
								<Users className='h-3 w-3' />
								{row.rolesCount} role{row.rolesCount !== 1 ? "s" : ""}
							</span>
						)}
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
							<div className='flex gap-1 min-w-0'>
								<Button
									size='sm'
									variant='outline'
									onClick={() => handleAddRole(row.opportunityId)}
									className='text-xs h-6'
								>
									<Plus className='h-3 w-3 mr-1' />
									Add Role
								</Button>
								{row.opportunityStatus === "In Progress" && (
									<Button
										size='sm'
										variant='secondary'
										onClick={() => handleMoveToHold(row.opportunityId)}
										className='text-xs h-6'
									>
										Hold
									</Button>
								)}
								{row.opportunityStatus === "On Hold" && (
									<Button
										size='sm'
										variant='default'
										onClick={() => handleMoveToInProgress(row.opportunityId)}
										className='text-xs h-6'
									>
										Resume
									</Button>
								)}
								{(row.opportunityStatus === "In Progress" ||
									row.opportunityStatus === "On Hold") && (
									<Button
										size='sm'
										variant='default'
										onClick={() => handleMoveToCompleted(row.opportunityId)}
										className='text-xs h-6'
									>
										Complete
									</Button>
								)}
							</div>
						</TableCell>
					)}
				</TableRow>
				
				<RoleStatusConfirmationDialog
					isOpen={confirmationDialog.isOpen}
					onClose={handleCloseDialog}
					onConfirm={handleConfirmStatusUpdate}
					status={confirmationDialog.status}
					roleName={confirmationDialog.roleName}
				/>
			</>
		);
	}


	return (
		<>
			<TableRow className='bg-gray-50/70'>
				<TableCell>
					<div
						className={
							row.isFirstRowForOpportunity
								? "flex items-center justify-center gap-2"
								: ""
						}
					>
						{row.roleName ? (
							<span 
								className='mr-auto cursor-pointer hover:text-blue-600 transition-colors'
								onClick={handleRoleNameClick}
							>
								{row.roleName}
							</span>
						) : (
							<span className='text-muted-foreground italic'>No role name</span>
						)}
					</div>
				</TableCell>
				<TableCell>
					{row.requiredGrade && (
						<Badge variant='outline'>{row.requiredGrade}</Badge>
					)}
				</TableCell>
				<TableCell>
					{row.roleStatus && <StatusBadge status={row.roleStatus} />}
				</TableCell>
				<TableCell>
					{row.assignedMember ? (
						<span>{row.assignedMember}</span>
					) : (
						<span className='text-muted-foreground italic'>Not assigned</span>
					)}
				</TableCell>
				<TableCell>
					{row.allocation ? (
						<span>{row.allocation}%</span>
					) : (
						<span className='text-muted-foreground italic'>—</span>
					)}
				</TableCell>
				<TableCell>
					{row.needsHire ? (
						<Badge variant='outline' className='text-xs'>
							Hiring needed
						</Badge>
					) : (
						<span className='text-muted-foreground italic'>—</span>
					)}
				</TableCell>

				{showActions && (
					<TableCell>
						{row.roleId && row.roleStatus === "Open" && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size='sm' variant='outline' className='h-6 w-6 p-0'>
										<MoreHorizontal className='h-3 w-3' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='start' className='w-32'>
									<DropdownMenuItem
										onClick={() =>
											handleStatusClick(row.opportunityId, row.roleId!, "Won", row.roleName)
										}
										className='text-green-600'
									>
										<CheckCircle className='h-3 w-3 mr-2 text-green-600' />
										Won
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											handleStatusClick(row.opportunityId, row.roleId!, "Staffed", row.roleName)
										}
										className='text-yellow-600'
									>
										<UserCheck className='h-3 w-3 mr-2 text-yellow-600' />
										Staffed
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											handleStatusClick(row.opportunityId, row.roleId!, "Lost", row.roleName)
										}
										className='text-red-600'
									>
										<XCircle className='h-3 w-3 mr-2 text-red-600' />
										Lost
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</TableCell>
				)}

				{showActions && <TableCell></TableCell>}
			</TableRow>
			
			{row.roleId && (
				<EditRoleModal
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					opportunityId={row.opportunityId}
					role={{
						id: row.roleId,
						roleName: row.roleName || '',
						requiredGrade: row.requiredGrade as any,
						status: row.roleStatus as any,
						assignedMember: null,
						allocation: row.allocation || 100,
						needsHire: row.needsHire || false,
						comments: ''
					}}
				/>
			)}

			<RoleStatusConfirmationDialog
				isOpen={confirmationDialog.isOpen}
				onClose={handleCloseDialog}
				onConfirm={handleConfirmStatusUpdate}
				status={confirmationDialog.status}
				roleName={confirmationDialog.roleName}
			/>
		</>
	);
};
