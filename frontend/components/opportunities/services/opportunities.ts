import { apiClient } from "@/lib/api-client";
import { ListType } from "../components/opportunities-table/types";
import type { Opportunity, OpportunityStatus } from "@/lib/types";

export const fetchOpportunities = async (
  listType: ListType,
  page: number,
  limit: number
): Promise<Opportunity[]> => {
  const status = listType === "in-progress" ? "In Progress" :
    listType === "on-hold" ? "On Hold" :
      "Done";

  const params = {
    page: page,
    limit: limit,
    status: status as OpportunityStatus
  };

  const response = await apiClient.opportunities.list(params);
  return response.data;
}; 