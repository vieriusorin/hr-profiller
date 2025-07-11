import { cn } from '@/lib/utils';
import {
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { OpportunitiesTableHeaderProps } from './types';

export const OpportunitiesTableHeader = ({
	showActions,
	className,
}: OpportunitiesTableHeaderProps) => {
	return (
		<TableHeader className={cn("bg-gray-50", className)}>
			<TableRow>
				<TableHead className='w-[200px]'>Opportunity</TableHead>
				<TableHead className='w-[150px]'>Client</TableHead>
				<TableHead className='w-[100px]'>Start Date</TableHead>
				<TableHead className='w-[90px]'>Probability</TableHead>
				<TableHead className='w-[60px]'>Comment</TableHead>
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
