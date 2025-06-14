import * as React from "react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { OpportunitiesTableRow } from "./components/opportunities-table-row";
import { useFlattenedOpportunities } from "./hooks/use-flattened-opportunities";
import type { FlattenedRow, OpportunitiesTableProps } from "./types";
import { createContext } from "react";
import { Opportunity } from "@/app/shared/types";
import { Loader2 } from "lucide-react";

export const OpportunitiesContext = createContext<{
	opportunities: Opportunity[];
}>({
	opportunities: [],
});

export const OpportunitiesTable = ({
	opportunities,
	showActions = true,
	onAddRole,
	onUpdateRole,
	onMoveToHold,
	onMoveToInProgress,
	onMoveToCompleted,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
}: OpportunitiesTableProps) => {
	console.log(JSON.stringify(opportunities, null, 2));
	const flattenedData = useFlattenedOpportunities(opportunities);

	const { ref, inView } = useInView({
		threshold: 0,
		triggerOnce: false,
	});

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage?.();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<OpportunitiesContext.Provider value={{ opportunities }}>
			<div className='rounded-md border h-full overflow-y-auto'>
				<Table className='relative'>
					<TableHeader className='sticky top-0 z-10 bg-background'>
						<TableRow>
							<TableHead className='w-[200px]'>Opportunity</TableHead>
							<TableHead className='w-[150px]'>Client</TableHead>
							<TableHead className='w-[120px]'>Start Date</TableHead>
							<TableHead className='w-[80px]'>Probability</TableHead>
							<TableHead className='w-[100px]'>Status</TableHead>
							<TableHead className='w-[180px]'>Comment</TableHead>
							<TableHead className='w-[150px]'>Role</TableHead>
							<TableHead className='w-[80px]'>Grade</TableHead>
							<TableHead className='w-[100px]'>Role Status</TableHead>
							<TableHead className='w-[150px]'>Assigned</TableHead>
							<TableHead className='w-[80px]'>Allocation</TableHead>
							<TableHead className='w-[80px]'>Hire</TableHead>
							{showActions && (
								<TableHead className='w-[60px]'>Role Actions</TableHead>
							)}
							{showActions && (
								<TableHead className='w-[400px]'>Opp. Actions</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{flattenedData.map((row: FlattenedRow) => (
							<OpportunitiesTableRow
								key={`${row.opportunityId}-${row.roleId || "opportunity"}`}
								row={row}
								showActions={showActions}
								onAddRole={onAddRole}
								onUpdateRole={onUpdateRole}
								onMoveToHold={onMoveToHold}
								onMoveToInProgress={onMoveToInProgress}
								onMoveToCompleted={onMoveToCompleted}
							/>
						))}
						{flattenedData.length === 0 && !isFetchingNextPage && (
							<TableRow>
								<TableCell
									colSpan={showActions ? 13 : 11}
									className='text-center py-8 text-muted-foreground'
								>
									No opportunities found
								</TableCell>
							</TableRow>
						)}
						{hasNextPage && (
							<TableRow ref={ref}>
								<TableCell
									colSpan={showActions ? 13 : 11}
									className='text-center'
								>
									{isFetchingNextPage ? (
										<div className='flex items-center justify-center p-4'>
											<Loader2 className='h-6 w-6 animate-spin' />
											<span className='ml-2'>Loading more...</span>
										</div>
									) : (
										<span>Scroll to load more</span>
									)}
								</TableCell>
							</TableRow>
						)}
						{!hasNextPage && opportunities.length > 0 && (
							<TableRow>
								<TableCell
									colSpan={showActions ? 13 : 11}
									className='text-center py-8 text-muted-foreground'
								>
									No more opportunities to load.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</OpportunitiesContext.Provider>
	);
};
