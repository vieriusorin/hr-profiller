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

export const EditRoleModal = ({
	isOpen,
	onClose,
	role,
	opportunity,
}: Omit<EditRoleModalProps, "opportunityId">) => {
	// Fetch the latest role data from cache/server
	const { data: latestRole, isLoading: isRoleLoading } = useRole(role.id);

	// Use the latest role data if available, otherwise fall back to the prop
	const currentRole = latestRole || role;

	const { handleSubmit, isPending } = useEditRoleModal({
		role: currentRole,
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
						key={`role-form-${currentRole.id}-${
							currentRole.updatedAt || "no-timestamp"
						}`}
						mode='edit'
						initialData={currentRole}
						onSubmit={handleSubmit}
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
	listType,
}: EditOpportunityModalProps) => {
	const { handleSubmit, isPending, isLoading, latestOpportunity } =
		useEditOpportunityModal({ isOpen, opportunity, listType, onClose });

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
						initialData={latestOpportunity || opportunity}
						mode='edit'
						isSubmitting={isPending}
						disabled={isLoading}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};
