"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Role } from "@/shared/types";
import { RoleForm } from "../forms/create-role-form";
import { useUpdateRoleMutation } from "../../hooks/use-opportunities-query";
import toast from "react-hot-toast";
import { CreateOpportunityForm } from "../forms/create-opportunity-form";
import {
	useUpdateOpportunityMutation,
	useOpportunityQuery,
} from "../../hooks/use-opportunities-query";
import { Opportunity } from "@/shared/types";
import { useQueryClient } from "@tanstack/react-query";

interface EditRoleModalProps {
	isOpen: boolean;
	onClose: () => void;
	opportunityId: string;
	role: Role;
}

export const EditRoleModal = ({
	isOpen,
	onClose,
	opportunityId,
	role,
}: EditRoleModalProps) => {
	const { mutate: updateRole, isPending } = useUpdateRoleMutation();

	const handleSubmit = async (updatedRole: Role) => {
		const loadingToast = toast.loading("Updating role...");

		updateRole(
			{
				opportunityId,
				roleId: role.id,
				roleData: {
					roleName: updatedRole.roleName,
					requiredGrade: updatedRole.requiredGrade,
					allocation: updatedRole.allocation,
					needsHire: updatedRole.needsHire,
					comments: updatedRole.comments,
				},
			},
			{
				onSuccess: () => {
					toast.dismiss(loadingToast);
					toast.success(`Role "${updatedRole.roleName}" updated successfully!`);
					onClose();
				},
				onError: (error) => {
					toast.dismiss(loadingToast);
					toast.error(
						`Failed to update role: ${
							error instanceof Error ? error.message : "Unknown error"
						}`
					);
					console.error("Failed to update role:", error);
				},
			}
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Role</DialogTitle>
				</DialogHeader>
				<RoleForm
					mode='edit'
					initialData={role}
					onSubmit={handleSubmit}
					onCancel={onClose}
					isSubmitting={isPending}
				/>
			</DialogContent>
		</Dialog>
	);
};

// Edit Opportunity Modal
interface EditOpportunityModalProps {
	isOpen: boolean;
	onClose: () => void;
	opportunity: Opportunity;
	listType: "in-progress" | "on-hold" | "completed";
}

export const EditOpportunityModal = ({
	isOpen,
	onClose,
	opportunity,
	listType,
}: EditOpportunityModalProps) => {
	const { mutate: updateOpportunity, isPending } =
		useUpdateOpportunityMutation();
	const { data: latestOpportunity, isLoading } = useOpportunityQuery(
		isOpen ? opportunity.id : ""
	);
	const queryClient = useQueryClient();

	const handleSubmit = async (updatedOpportunity: Opportunity) => {
		const loadingToast = toast.loading("Updating opportunity...");
		updateOpportunity(
			{
				opportunityId: opportunity.id,
				updatedOpportunity: {
					...opportunity,
					...updatedOpportunity,
				},
				listType,
			},
			{
				onSuccess: () => {
					toast.dismiss(loadingToast);
					toast.success(
						`Opportunity "${updatedOpportunity.opportunityName}" updated successfully!`
					);
					queryClient.invalidateQueries({
						queryKey: ["opportunity", opportunity.id],
					});
					onClose();
				},
				onError: (error) => {
					toast.dismiss(loadingToast);
					toast.error(
						`Failed to update opportunity: ${
							error instanceof Error ? error.message : "Unknown error"
						}`
					);
					console.error("Failed to update opportunity:", error);
				},
			}
		);
	};

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
