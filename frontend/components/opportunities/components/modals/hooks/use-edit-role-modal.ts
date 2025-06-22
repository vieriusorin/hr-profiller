import { useUpdateRole } from "@/lib/hooks/use-roles";
import toast from "react-hot-toast";
import { UseEditRoleModalProps } from "../types";
import { useCallback } from "react";
import { UpdateRole } from "@/lib/api-client";
import type { CreateRoleFormData } from "../../forms/schemas";

export const useEditRoleModal = ({ role, onClose }: Omit<UseEditRoleModalProps, 'opportunityId'>) => {
    const updateRoleMutation = useUpdateRole();
    const mapFormDataToAPI = (formData: CreateRoleFormData): UpdateRole => {
        const status: UpdateRole['status'] = formData.needsHire ? 'Open' : 'Staffed';

        return {
            roleName: formData.roleName,
            jobGrade: formData.requiredGrade as UpdateRole['jobGrade'],
            level: formData.opportunityLevel as UpdateRole['level'],
            allocation: formData.allocation,
            status,
            notes: formData.comments || null,
        };
    };

    const handleSubmit = useCallback(async (formData: CreateRoleFormData) => {
        const loadingToast = toast.loading("Updating role...");

        try {
            const updateData = mapFormDataToAPI(formData);

            await updateRoleMutation.mutateAsync({
                id: role.id,
                data: updateData
            });

            toast.dismiss(loadingToast);
            toast.success(`Role "${formData.roleName}" updated successfully!`);
            onClose();
        } catch (error) {
            toast.dismiss(loadingToast);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            toast.error(`Failed to update role: ${errorMessage}`);
            console.error("Failed to update role:", error);
        }
    }, [role.id, onClose, updateRoleMutation]);

    return {
        handleSubmit,
        isPending: updateRoleMutation.isPending,
    }
}