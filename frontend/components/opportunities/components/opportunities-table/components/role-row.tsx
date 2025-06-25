import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { StatusBadge } from "@/shared/components/status-badge";
import { AlertCircleIcon, CheckCircleIcon, Users } from "lucide-react";
import { EditRoleModal } from "../../modals/edit-role-modal";
import { RoleStatusConfirmationDialog } from "../../role-status-confirmation";
import { RoleStatus } from "@/lib/types";
import { RoleRowProps } from "./types";
import { useRoleRow } from "../hooks/use-role-row";
import { RoleActions } from "./role-actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const RoleRow = ({
	row,
	urgencyConfig,
	showActions,
	fullOpportunity,
	employees,
	onUpdateRole,
}: RoleRowProps) => {
	const {
		isEditModalOpen,
		confirmationDialog,
		handleRoleNameClick,
		handleCloseEditModal,
		handleStatusClick,
		handleConfirmStatusUpdate,
		handleCloseDialog,
	} = useRoleRow(onUpdateRole);

	const roleDetails = fullOpportunity?.roles.find(
		(role) => role.id === row.roleId
	);

	return (
		<>
			<TableRow
				className={`${urgencyConfig.bgClass} transition-colors duration-200`}
			>
				{/* Empty cells for Opportunity columns */}
				<TableCell></TableCell>
				<TableCell></TableCell>
				<TableCell></TableCell>
				<TableCell></TableCell>
				<TableCell></TableCell>

				{/* Role-specific cells start here */}
				<TableCell>
					<span
						className='mr-auto cursor-pointer hover:text-blue-600 transition-colors'
						onClick={handleRoleNameClick}
					>
						{row.roleName}
					</span>
				</TableCell>
				<TableCell>
					{row.requiredGrade && (
						<Badge variant='outline'>{row.requiredGrade}</Badge>
					)}
				</TableCell>
				<TableCell>
					{row.roleStatus && (
						<StatusBadge status={row.roleStatus as RoleStatus} />
					)}
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
										return <li key={id}>{employee?.fullName || "Unknown"}</li>;
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
					{!row.needsHire ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<CheckCircleIcon className='h-3 w-3 text-green-500 cursor-pointer' />
							</TooltipTrigger>
							<TooltipContent className='max-w-xs whitespace-pre-wrap'>
								No hire needed
							</TooltipContent>
						</Tooltip>
					) : (
						<Tooltip>
							<TooltipTrigger asChild>
								<AlertCircleIcon className='h-3 w-3 text-red-500 cursor-pointer' />
							</TooltipTrigger>
							<TooltipContent className='max-w-xs whitespace-pre-wrap'>
								Hire needed
							</TooltipContent>
						</Tooltip>
					)}
				</TableCell>

				{showActions && (
					<TableCell>
						{row.roleId && row.roleStatus === "Open" && (
							<RoleActions
								opportunityId={row.opportunityId}
								roleId={row.roleId}
								roleName={row.roleName}
								roleStatus={row.roleStatus as RoleStatus}
								onStatusClick={handleStatusClick}
							/>
						)}
					</TableCell>
				)}

				{showActions && <TableCell></TableCell>}
			</TableRow>

			{roleDetails && fullOpportunity && (
				<EditRoleModal
					isOpen={isEditModalOpen}
					onClose={handleCloseEditModal}
					role={roleDetails}
					opportunity={fullOpportunity}
				/>
			)}

			<RoleStatusConfirmationDialog
				isOpen={confirmationDialog.isOpen}
				onClose={handleCloseDialog}
				onConfirm={handleConfirmStatusUpdate}
				roleName={confirmationDialog.roleName}
				status={confirmationDialog.status}
			/>
		</>
	);
};
