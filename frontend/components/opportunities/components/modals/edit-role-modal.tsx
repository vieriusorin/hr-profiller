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
import { Role, UpdateRole, RoleResponse } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

export const EditRoleModal = ({
	isOpen,
	onClose,
	role,
	opportunity,
}: Omit<EditRoleModalProps, "opportunityId">) => {
	const { data: latestRoleData, isLoading: isRoleLoading } = useRole(role.id, {
		enabled: isOpen,
		refetchOnMount: true,
	});

	const currentRole = latestRoleData?.data || role;

	const { handleSubmit, isPending } = useEditRoleModal({
		opportunityId: opportunity.id,
		role: { data: currentRole },
		onClose,
	});

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Role</DialogTitle>
				</DialogHeader>
				{isRoleLoading ? (
					<div className='space-y-4'>
						<Skeleton className='h-10 w-full' />
						<Skeleton className='h-10 w-full' />
						<Skeleton className='h-10 w-full' />
						<Skeleton className='h-20 w-full' />
					</div>
				) : (
					<RoleForm
						mode='edit'
						initialData={currentRole}
						onSubmit={async (data) => {
							await handleSubmit(data);
							return { status: 'success', data: currentRole } as RoleResponse;
						}}
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
