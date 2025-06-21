import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, UserCheck, XCircle } from "lucide-react";
import { RoleStatusActionsProps } from "./types";
import { RoleStatusConfirmationDialog } from "../role-status-confirmation";
import { useRoleStatusActions } from "./hooks/use-role-status-actions";
import { RoleStatus } from "@/lib/types";

export const RoleStatusActions = ({
	status,
	show,
	onStatusUpdate,
}: RoleStatusActionsProps) => {
	const {
		confirmationDialog,
		handleStatusClick,
		handleConfirm,
		handleCloseDialog,
	} = useRoleStatusActions({ onStatusUpdate });

	if (!show || status !== "Open") {
		return null;
	}

	return (
		<>
			<div className='mt-4 pt-3 border-t border-gray-200'>
				<Label className='text-sm font-medium mb-2 block'>
					Update Role Status:
				</Label>
				<div className='flex gap-2'>
					<Button
						size='sm'
						variant='outline'
						className='text-green-600 border-green-200 hover:bg-green-50'
						onClick={() => handleStatusClick("Won")}
					>
						<CheckCircle className='h-3 w-3 mr-1 text-green-600' />
						Won
					</Button>
					<Button
						size='sm'
						variant='outline'
						className='text-yellow-600 border-yellow-200 hover:bg-yellow-50'
						onClick={() => handleStatusClick("Staffed")}
					>
						<UserCheck className='h-3 w-3 mr-1 text-yellow-600' />
						Staffed
					</Button>
					<Button
						size='sm'
						variant='outline'
						className='text-red-600 border-red-200 hover:bg-red-50'
						onClick={() => handleStatusClick("Lost")}
					>
						<XCircle className='h-3 w-3 mr-1 text-red-600' />
						Lost
					</Button>
				</div>
				<p className='text-xs text-gray-500 mt-2'>
					💡 The opportunity will automatically move to &quot;Completed&quot;
					when all roles are resolved
				</p>
			</div>

			<RoleStatusConfirmationDialog
				isOpen={confirmationDialog.isOpen}
				onClose={handleCloseDialog}
				onConfirm={handleConfirm}
				status={confirmationDialog.status as RoleStatus}
			/>
		</>
	);
};
