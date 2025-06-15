import React, { createContext } from "react";
import { Opportunity } from "@/app/shared/types";
import { Loader2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import { useOpportunitiesTable } from "../../hooks/use-opportunities-table";
import { OpportunitiesTableProps, FlattenedRow } from "./types";
import { OpportunitiesTableRow } from "./components/opportunities-table-row";
import { OpportunitiesTableHeader } from "./components/opportunities-table-header";

export const OpportunitiesContext = createContext<{
	opportunities: Opportunity[];
}>({
	opportunities: [],
});

export const OpportunitiesTable = ({
	listType,
	showActions,
	caption,
	onAddRole,
	onUpdateRole,
	onMoveToHold,
	onMoveToInProgress,
	onMoveToCompleted,
}: OpportunitiesTableProps) => {
	const { data, flattenedData, ref, isFetchingNextPage, hasNextPage } =
		useOpportunitiesTable(listType);

	if (!data) return null;

	return (
		<OpportunitiesContext.Provider value={{ opportunities: data.pages.flat() }}>
			<div className='rounded-md border h-full overflow-y-auto'>
				<Table className='relative'>
					{caption && <TableCaption>{caption}</TableCaption>}
					<OpportunitiesTableHeader
						showActions={showActions}
						className='sticky top-0 z-10'
					/>
					<TableBody>
						{flattenedData.map((row: FlattenedRow) => (
							<OpportunitiesTableRow
								key={`${row.opportunityId}-${row.roleId || "opportunity"}`}
								row={row}
								showActions={showActions ?? false}
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
									colSpan={showActions ? 14 : 12}
									className='text-center py-8 text-muted-foreground'
								>
									No opportunities found
								</TableCell>
							</TableRow>
						)}
						{hasNextPage && (
							<TableRow ref={ref}>
								<TableCell
									colSpan={showActions ? 14 : 12}
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
						{!hasNextPage && flattenedData.length > 0 && (
							<TableRow>
								<TableCell
									colSpan={showActions ? 14 : 12}
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
