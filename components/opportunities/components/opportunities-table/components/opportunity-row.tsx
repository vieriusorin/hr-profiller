import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar } from 'lucide-react';
import { StatusBadge } from '@/shared/components/status-badge';
import { ProbabilityBadge } from '@/shared/components/probability-badge';
import { CountdownBadge } from '@/shared/components/countdown-badge';
import { OpportunityActions } from './opportunity-actions';
import { useOpportunityRow } from '../hooks/use-opportunity-row';
import { OpportunityRowProps } from './types';

export const OpportunityRow = ({
  row,
  showActions,
  onAddRole,
  onMoveToHold,
  onMoveToInProgress,
  onMoveToCompleted,
  onEditOpportunity,
}: OpportunityRowProps) => {
  const { urgencyConfig, tooltip } = useOpportunityRow(row);

  return (
    <TableRow
      className={`${urgencyConfig.bgClass} transition-colors duration-200`}
      title={tooltip}
    >
      <TableCell rowSpan={row.rowSpan} className='font-medium align-top'>
        <div>
          <div
            className='font-semibold underline decoration-dotted underline-offset-4 cursor-pointer'
            onClick={onEditOpportunity}
          >
            {row.opportunityName}
          </div>
          <div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'>
            {row.hasHiringNeeds && (
              <Badge variant='outline' className='ml-1 text-xs'>
                Hiring needed
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell rowSpan={row.rowSpan} className='align-top'>
        <div className='flex items-center gap-1'>
          <Building className='h-3 w-3' />
          {row.clientName}
        </div>
      </TableCell>
      <TableCell rowSpan={row.rowSpan} className='align-top'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            <span
              className={`font-medium ${urgencyConfig.textClass}`}
              title={tooltip}
            >
              {row.expectedStartDate}
            </span>
          </div>
          <CountdownBadge startDate={row.expectedStartDate} size='sm' />
        </div>
      </TableCell>
      <TableCell rowSpan={row.rowSpan} className='align-top'>
        <ProbabilityBadge probability={row.probability} size='sm' />
      </TableCell>
      <TableCell rowSpan={row.rowSpan} className='align-top'>
        <StatusBadge status={row.opportunityStatus} />
      </TableCell>

      {showActions && (
        <TableCell rowSpan={row.rowSpan} className='align-top'>
          <OpportunityActions
            opportunityId={row.opportunityId}
            opportunityStatus={row.opportunityStatus}
            onAddRole={onAddRole}
            onMoveToHold={onMoveToHold}
            onMoveToInProgress={onMoveToInProgress}
            onMoveToCompleted={onMoveToCompleted}
          />
        </TableCell>
      )}
    </TableRow>
  );
}; 