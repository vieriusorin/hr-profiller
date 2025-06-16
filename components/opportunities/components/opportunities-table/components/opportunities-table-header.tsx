import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface OpportunitiesTableHeaderProps {
	showActions?: boolean;
	className?: string;
}

export const OpportunitiesTableHeader = ({
	showActions,
	className,
}: OpportunitiesTableHeaderProps) => {
	return (
		<TableHeader className={cn("bg-gray-50", className)}>
			<TableRow>
				<TableHead className='w-[200px]'>Opportunity</TableHead>
				<TableHead className='w-[150px]'>Client</TableHead>
				<TableHead className='w-[150px]'>Start Date</TableHead>
				<TableHead className='w-[100px]'>Probability</TableHead>
				<TableHead className='w-[120px]'>Status</TableHead>
				<TableHead className='w-[180px]'>Comment</TableHead>
				<TableHead className='w-[100px]'>Roles</TableHead>
				<TableHead className='w-[100px]'>Grade</TableHead>
				<TableHead className='w-[100px]'>Role Status</TableHead>
				<TableHead className='w-[100px]'>Assigned</TableHead>
				<TableHead className='w-[100px]'>Allocation</TableHead>
				<TableHead className='w-[100px]'>Needs Hire</TableHead>
				{showActions && (
					<TableHead className='w-[100px]'>Role Actions</TableHead>
				)}
				{showActions && (
					<TableHead className='w-[150px]'>Opportunity Actions</TableHead>
				)}
			</TableRow>
		</TableHeader>
	);
};
