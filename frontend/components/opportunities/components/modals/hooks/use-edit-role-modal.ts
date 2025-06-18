import { useUpdateRoleMutation } from "../../../hooks/use-opportunities-query";
import toast from "react-hot-toast";
import { Role } from "@/shared/types";
import { UseEditRoleModalProps } from "../types";
import { useCallback } from "react";

export const useEditRoleModal = ({ opportunityId, role, onClose }: UseEditRoleModalProps) => {
    const { mutate: updateRole, isPending } = useUpdateRoleMutation();

    const handleSubmit = useCallback( async (updatedRole: Role & { assignedMemberIds?: string[] }) => {
        const loadingToast = toast.loading("Updating role...");

        updateRole(
            {
                opportunityId,
                roleId: role.id,
                roleData: {
                    ...updatedRole,
                },
            },
            {
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success(`Role "${updatedRole.roleName}" updated successfully!`);
                    onClose();
                },
                onError: (error: Error) => {
                    toast.dismiss(loadingToast);
                    toast.error(
                        `Failed to update role: ${error instanceof Error ? error.message : "Unknown error"
                        }`
                    );
                    console.error("Failed to update role:", error);
                },
            }
        );
    }, [opportunityId, role, onClose, updateRole]);

    return {
        handleSubmit,
        isPending,
    }
}