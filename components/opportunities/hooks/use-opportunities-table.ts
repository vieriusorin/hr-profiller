import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Opportunity } from "@/app/shared/types";
import { ListType } from "../components/opportunities-table/types";
import { useFlattenedOpportunities } from "./use-flattened-opportunities";
import { fetchOpportunities } from "../services/opportunities";

export const useOpportunitiesTable = (listType: ListType) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<Opportunity[], Error>({
    queryKey: ["opportunities", listType],
    queryFn: ({ pageParam }) =>
      fetchOpportunities(listType, pageParam as number, 10),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      return lastPage.length > 0 ? nextPage : undefined;
    },
  });

  const flattenedData = useFlattenedOpportunities(data?.pages.flat() ?? []);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return {
    data,
    flattenedData,
    ref,
    error,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
}; 