import { useState, useContext } from "react";

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
import { CountdownBadge } from "@/shared/components/countdown-badge";
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
import { EditOpportunityModal } from "../../modals/edit-role-modal";
import { OpportunitiesContext } from "../opportunities-table";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RoleStatus } from "@/app/shared/types";
import { Grade } from "@/app/shared/types";
import { useQuery } from "@tanstack/react-query";
import { Employee } from "@/shared/types/employees";

const fetchEmployees = async (): Promise<Employee[]> => {
	const res = await fetch("/api/employees");
	if (!res.ok) {
		throw new Error("Failed to fetch employees");
	}
	return res.json();
};

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
		status: "Won" | "Staffed" | "Lost";
		opportunityId: string;
		roleId: string;
		roleName?: string;
	}>({
		isOpen: false,
		status: "Won",
		opportunityId: "",
		roleId: "",
		roleName: "",
	});

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isEditOpportunityModalOpen, setIsEditOpportunityModalOpen] =
		useState(false);

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

	const { opportunities } = useContext(OpportunitiesContext) || {
		opportunities: [],
	};
	const fullOpportunity = opportunities.find(
		(opp) => opp.id === row.opportunityId
	);

	const { data: employees = [] } = useQuery<Employee[]>({
		queryKey: ["employees"],
		queryFn: fetchEmployees,
	});

	const handleStatusClick = (
		opportunityId: string,
		roleId: string,
		status: "Won" | "Staffed" | "Lost",
		roleName?: string
	) => {
		setConfirmationDialog({
			isOpen: true,
			status,
			opportunityId,
			roleId,
			roleName,
		});
	};

	const handleConfirmStatusUpdate = () => {
		handleUpdateRole(
			confirmationDialog.opportunityId,
			confirmationDialog.roleId,
			confirmationDialog.status
		);
	};

	const handleCloseDialog = () => {
		setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
	};

	const handleRoleNameClick = () => {
		setIsEditModalOpen(true);
	};

	if (row.isOpportunityRow) {
		const urgency = getStartDateUrgency(row.expectedStartDate);
		const urgencyConfig = getUrgencyConfig(urgency);
		const tooltip = getUrgencyTooltip(row.expectedStartDate);

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
								onClick={() => setIsEditOpportunityModalOpen(true)}
							>
								{row.opportunityName}
							</div>
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
							<CountdownBadge startDate={row.expectedStartDate} size='sm' />
						</div>
					</TableCell>
					<TableCell rowSpan={row.rowSpan} className='align-top'>
						<ProbabilityBadge probability={row.probability} size='sm' />
					</TableCell>
					<TableCell rowSpan={row.rowSpan} className='align-top'>
						<StatusBadge status={row.opportunityStatus} />
					</TableCell>

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

				{fullOpportunity && (
					<EditOpportunityModal
						isOpen={isEditOpportunityModalOpen}
						onClose={() => setIsEditOpportunityModalOpen(false)}
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

	const urgency = getStartDateUrgency(row.expectedStartDate);
	const urgencyConfig = getUrgencyConfig(urgency);

	return (
		<>
			<TableRow
				className={`${urgencyConfig.bgClass} transition-colors duration-200`}
			>
				<TableCell className='text-muted-foreground italic text-center'></TableCell>
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
					{row.assignedMemberIds && row.assignedMemberIds.length > 0 ? (
						<Popover>
							<PopoverTrigger>
								<span className='flex items-center gap-1 text-xs underline decoration-dotted underline-offset-4 cursor-pointer'>
									<Users className='h-3 w-3' />
									{row.assignedMemberIds.length} assigned
								</span>
							</PopoverTrigger>
							<PopoverContent>
								<ul>
									{row.assignedMemberIds.map((id) => {
										const employee = employees.find((e) => e.id === id);
										return <li key={id}>{employee?.name || "Unknown"}</li>;
									})}
								</ul>
							</PopoverContent>
						</Popover>
					) : (
						<span className='text-muted-foreground italic'>—</span>
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
							{row.newHireName || "Awaiting Hire"}
						</Badge>
					) : row.assignedMemberIds && row.assignedMemberIds.length > 0 ? (
						<Popover>
							<PopoverTrigger>
								<span className='flex items-center gap-1 text-xs underline decoration-dotted underline-offset-4 cursor-pointer'>
									<Users className='h-3 w-3' />
									{row.assignedMemberIds.length} assigned
								</span>
							</PopoverTrigger>
							<PopoverContent>
								<ul>
									{row.assignedMemberIds.map((id) => {
										const employee = employees.find((e) => e.id === id);
										return <li key={id}>{employee?.name || "Unknown"}</li>;
									})}
								</ul>
							</PopoverContent>
						</Popover>
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
											handleStatusClick(
												row.opportunityId,
												row.roleId!,
												"Won",
												row.roleName
											)
										}
										className='text-green-600'
									>
										<CheckCircle className='h-3 w-3 mr-2 text-green-600' />
										Won
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											handleStatusClick(
												row.opportunityId,
												row.roleId!,
												"Staffed",
												row.roleName
											)
										}
										className='text-yellow-600'
									>
										<UserCheck className='h-3 w-3 mr-2 text-yellow-600' />
										Staffed
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											handleStatusClick(
												row.opportunityId,
												row.roleId!,
												"Lost",
												row.roleName
											)
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
					role={
						fullOpportunity?.roles.find((r) => r.id === row.roleId) || {
							id: row.roleId!,
							roleName: row.roleName || "",
							requiredGrade: row.requiredGrade as Grade,
							status: row.roleStatus as RoleStatus,
							assignedMemberIds: row.assignedMemberIds || [],
							allocation: row.allocation || 0,
							needsHire: row.needsHire || false,
							newHireName: row.newHireName || "",
						}
					}
					opportunityId={row.opportunityId}
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
