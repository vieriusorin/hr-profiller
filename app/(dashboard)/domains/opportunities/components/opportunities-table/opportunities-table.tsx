import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OpportunitiesTableRow } from './components/opportunities-table-row';
import { useFlattenedOpportunities } from './hooks/use-flattened-opportunities';
import type { FlattenedRow, OpportunitiesTableProps } from './types';

export const OpportunitiesTable = ({
  opportunities,
  showActions = true,
  onAddRole,
  onUpdateRole,
  onMoveToHold,
  onMoveToInProgress,
  onMoveToCompleted,
}: OpportunitiesTableProps) => {
  const flattenedData = useFlattenedOpportunities(opportunities);

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[200px]'>Opportunity</TableHead>
            <TableHead className='w-[150px]'>Client</TableHead>
            <TableHead className='w-[120px]'>Start Date</TableHead>
            <TableHead className='w-[80px]'>Probability</TableHead>
            <TableHead className='w-[100px]'>Status</TableHead>
            <TableHead className='w-[150px]'>Role</TableHead>
            <TableHead className='w-[80px]'>Grade</TableHead>
            <TableHead className='w-[100px]'>Role Status</TableHead>
            <TableHead className='w-[150px]'>Assigned</TableHead>
            <TableHead className='w-[80px]'>Allocation</TableHead>
            <TableHead className='w-[80px]'>Hire</TableHead>
            {showActions && <TableHead className='w-[60px]'>Role Actions</TableHead>}
            {showActions && <TableHead className='w-[400px]'>Opp. Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {flattenedData.map((row: FlattenedRow, index: number) => (
            <OpportunitiesTableRow
              key={`${row.opportunityId}-${row.roleId || 'no-role'}-${index}`}
              row={row}
              showActions={showActions}
              onAddRole={onAddRole}
              onUpdateRole={onUpdateRole}
              onMoveToHold={onMoveToHold}
              onMoveToInProgress={onMoveToInProgress}
              onMoveToCompleted={onMoveToCompleted}
            />
          ))}
          {flattenedData.length === 0 && (
            <TableRow>
              <TableCell 
                colSpan={showActions ? 13 : 11} 
                className='text-center py-8 text-muted-foreground'
              >
                No opportunities found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}; 
