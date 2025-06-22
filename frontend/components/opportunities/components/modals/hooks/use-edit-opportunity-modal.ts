import {
	useUpdateOpportunityMutation,
	useOpportunityQuery,
} from "../../../hooks/use-opportunities-query";
import { UpdateOpportunity } from '@/lib/api-client';
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UseEditOpportunityModalProps } from "../types";

export const useEditOpportunityModal = ({ isOpen, opportunity, onClose }: UseEditOpportunityModalProps) => {
	const { mutate: updateOpportunity, isPending } =
		useUpdateOpportunityMutation();
	const { data: latestOpportunity, isLoading } = useOpportunityQuery(
		isOpen ? opportunity.id : ""
	);
	const queryClient = useQueryClient();

	const handleSubmit = async (updatedOpportunity: UpdateOpportunity) => {
		const loadingToast = toast.loading("Updating opportunity...");
		updateOpportunity(
			{
				id: opportunity.id,
				data: {
					...opportunity,
					...updatedOpportunity,
					clientName: updatedOpportunity.clientName ?? opportunity.clientName ?? undefined,
				}
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
						`Failed to update opportunity: ${error instanceof Error ? error.message : "Unknown error"
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