import {
	useUpdateOpportunityMutation,
	useOpportunityQuery,
} from "../../../hooks/use-opportunities-query";
import { Opportunity } from "@/shared/types";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UseEditOpportunityModalProps } from "../types";

export const useEditOpportunityModal = ({isOpen, opportunity, listType, onClose}: UseEditOpportunityModalProps) => {
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
				onError: (error: Error) => {
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

    return {
        handleSubmit,
        isPending,
        isLoading,
        latestOpportunity,
    }
}