import { Opportunity } from "@/app/shared/types";
import { ListType } from "../components/opportunities-table/types";

const API_BASE_URL = "/api/opportunities";

export const fetchOpportunities = async (
  listType: ListType,
  page: number,
  limit: number
): Promise<Opportunity[]> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (listType === "in-progress") {
    params.append("status", "In Progress");
  } else if (listType === "on-hold") {
    params.append("status", "On Hold");
  } else if (listType === "completed") {
    params.append("status", "Done");
  }

  const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch opportunities");
  }

  return response.json();
}; 