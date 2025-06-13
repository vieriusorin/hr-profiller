import { useUpdateRoleMutation } from "../../../hooks/use-opportunities-query";
import toast from "react-hot-toast";
import { Role } from "@/shared/types";
import { UseEditRoleModalProps } from "../types";

export const useEditRoleModal = ({opportunityId, role, onClose}: UseEditRoleModalProps) => {
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
                onError: (error: Error) => {
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
    }
    
    return {
        handleSubmit,
        isPending,
    }
}