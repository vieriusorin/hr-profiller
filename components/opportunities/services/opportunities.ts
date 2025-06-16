import { Opportunity } from "@/app/shared/types";
import { ListType } from "../components/opportunities-table/types";

const API_BASE_URL = "/api/opportunities";

export const fetchOpportunities = async (
  listType: ListType,
  page: number,
  limit: number
): Promise<Opportunity[]> => {
  const status = listType === "in-progress" ? "In Progress" :
    listType === "on-hold" ? "On Hold" :
      "Done";

  const params = new URLSearchParams({
    _page: page.toString(),
    _limit: limit.toString(),
    status: status,
  });

  const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch opportunities");
  }

  return response.json();
}; 