"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { RoleForm } from "../forms/create-role-form";
import { CreateOpportunityForm } from "../forms/create-opportunity-form";
import { EditOpportunityModalProps, EditRoleModalProps } from "./types";
import { useEditRoleModal } from "./hooks/use-edit-role-modal";
import { useEditOpportunityModal } from "./hooks/use-edit-opportunity-modal";
import { useRole } from "@/lib/hooks/use-roles";
import { Role, UpdateRole } from "@/lib/api-client";

export const EditRoleModal = ({
	isOpen,
	onClose,
	role,
	opportunity,
}: Omit<EditRoleModalProps, "opportunityId">) => {
	const { data: latestRole, isLoading: isRoleLoading } = useRole(role.id);
	const currentRole = latestRole || role;

	const { handleSubmit, isPending } = useEditRoleModal({
		role: currentRole as Role,
		onClose,
	});

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Role</DialogTitle>
				</DialogHeader>
				{isRoleLoading ? (
					<div className='p-4 text-center text-muted-foreground'>
						Loading latest role data...
					</div>
				) : (
					<RoleForm
						mode='edit'
						initialData={currentRole as Role}
						onSubmit={handleSubmit as (role: UpdateRole) => Promise<void>}
						onCancel={onClose}
						isSubmitting={isPending}
						opportunity={opportunity}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};

export const EditOpportunityModal = ({
	isOpen,
	onClose,
	opportunity,
}: EditOpportunityModalProps) => {
	const { handleSubmit, isPending, isLoading, latestOpportunity } =
		useEditOpportunityModal({ isOpen, opportunity, onClose });

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Opportunity</DialogTitle>
				</DialogHeader>
				{isLoading ? (
					<div className='p-4 text-center text-muted-foreground'>
						Loading...
					</div>
				) : (
					<CreateOpportunityForm
						onSubmit={handleSubmit}
						onCancel={onClose}
						initialData={latestOpportunity?.data || opportunity}
						mode='edit'
						isSubmitting={isPending}
						disabled={isLoading}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};
