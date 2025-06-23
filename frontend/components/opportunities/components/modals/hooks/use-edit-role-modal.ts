import { useUpdateRole, roleKeys } from "@/lib/hooks/use-roles";
import { opportunityKeys } from "@/lib/hooks/use-opportunities";
import toast from "react-hot-toast";
import { UseEditRoleModalProps } from "../types";
import { useCallback } from "react";
import { UpdateRole } from "@/lib/api-client";
import type { CreateRoleFormData } from "../../forms/schemas";
import { useQueryClient } from "@tanstack/react-query";

export const useEditRoleModal = ({ role, opportunityId, onClose }: UseEditRoleModalProps) => {
    const updateRoleMutation = useUpdateRole();
    const queryClient = useQueryClient();
    
    const mapFormDataToAPI = (formData: UpdateRole): UpdateRole => {
        // const status: UpdateRole['status'] = formData.needsHire ? 'Open' : 'Staffed';
        // TODO: Hardcoded value
        const status: UpdateRole['status'] = 'Open';

        console.log(formData, 'formData')

        return {
            roleName: formData.roleName,
            jobGrade: formData.jobGrade as UpdateRole['jobGrade'],
            level: formData.level as UpdateRole['level'],
            allocation: formData.allocation,
            status,
            notes: formData.notes || null,
        };
    };

    const handleSubmit = useCallback(async (formData: CreateRoleFormData) => {
        const loadingToast = toast.loading("Updating role...");

        try {
            const updateData = mapFormDataToAPI(formData);
            
            await updateRoleMutation.mutateAsync({
                id: (role as any)?.data.id,
                data: updateData
            });

            queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
            queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
            queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(opportunityId) });
            queryClient.invalidateQueries({ 
                queryKey: roleKeys.list({ opportunityId }) 
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
    }, [role, opportunityId, onClose, updateRoleMutation, queryClient]);

    return {
        handleSubmit,
        isPending: updateRoleMutation.isPending,
    }
}