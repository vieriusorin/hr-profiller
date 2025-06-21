"use client";

import { Card } from "@/components/ui/card";
import { RoleDetails } from "./role-details";
import { RoleStatusActions } from "./role-status-actions";

import { RoleComments } from "./role-comments";
import { useRoleCard } from "./hooks/useRoleCard";
import { useRoleCardModal } from "./hooks/use-role-card-modal";
import { RoleCardProps } from "./types";
import { EditRoleModal } from "../modals/edit-role-modal";
import { RoleStatus } from "@/lib/types";

export const RoleCard = ({
	role,
	showActions = true,
	onUpdateStatus,
	opportunity,
}: Omit<RoleCardProps, "opportunityId">) => {
	const { handleStatusUpdate } = useRoleCard({
		roleId: role.id,
		onUpdateStatus,
	});

	const { isEditModalOpen, handleRoleNameClick, handleCloseModal } =
		useRoleCardModal();

	return (
		<>
			<Card className='p-4 bg-gray-50'>
				<RoleDetails role={role} onRoleNameClick={handleRoleNameClick} />

				<RoleStatusActions
					status={role.status as RoleStatus}
					show={showActions}
					onStatusUpdate={handleStatusUpdate}
				/>

				{/* TODO: Implement assigned member display based on assignedMemberIds */}

				{role.notes && <RoleComments comments={role.notes} />}
			</Card>

			<EditRoleModal
				isOpen={isEditModalOpen}
				onClose={handleCloseModal}
				role={role}
				opportunity={opportunity}
			/>
		</>
	);
};
