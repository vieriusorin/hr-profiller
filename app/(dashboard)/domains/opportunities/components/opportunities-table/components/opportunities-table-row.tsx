import * as React from 'react';

import {
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/shared/components/status-badge';
import { ProbabilityBadge } from '@/shared/components/probability-badge';
import { Building, Calendar, Plus, Users, CheckCircle, UserCheck, XCircle } from 'lucide-react';
import { getStartDateUrgency, getUrgencyConfig, getUrgencyTooltip } from '@/shared/lib/helpers/date-urgency';
import type { OpportunitiesTableRowProps } from './types';
import { useOpportunitiesTableRow } from './hooks/use-opportunities-table-row';

export const OpportunitiesTableRow = ({
  row,
  showActions,
  onAddRole,
  onUpdateRole,
  onMoveToHold,
  onMoveToInProgress,
  onMoveToCompleted,
}: OpportunitiesTableRowProps) => {
  const { handleMoveToHold, handleMoveToInProgress, handleMoveToCompleted, handleAddRole, handleUpdateRole } = useOpportunitiesTableRow({
    onMoveToHold,
    onMoveToInProgress,
    onMoveToCompleted,
    onAddRole,
    onUpdateRole,
  });

  return (
    <TableRow>
      {row.isFirstRowForOpportunity && (
        <>
          <TableCell rowSpan={row.rowSpan} className='font-medium align-top'>
            <div>
              <div className='font-semibold'>{row.opportunityName}</div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'>
                <Users className='h-3 w-3' />
                {row.rolesCount} role{row.rolesCount !== 1 ? 's' : ''}
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
            <div className='flex items-center gap-1'>
              <Calendar className='h-3 w-3' />
              <span
                className={`${getUrgencyConfig(getStartDateUrgency(row.expectedStartDate)).textClass}`}
                title={getUrgencyTooltip(row.expectedStartDate)}
              >
                {row.expectedStartDate}
              </span>
            </div>
          </TableCell>
          <TableCell rowSpan={row.rowSpan} className='align-top'>
            <ProbabilityBadge probability={row.probability} size='sm' />
          </TableCell>
          <TableCell rowSpan={row.rowSpan} className='align-top'>
            <StatusBadge status={row.opportunityStatus} />
          </TableCell>
        </>
      )}

      <TableCell>
        {row.roleName ? (
          <div className='font-medium'>{row.roleName}</div>
        ) : (
          <span className='text-muted-foreground italic'>No roles added</span>
        )}
      </TableCell>
      <TableCell>
        {row.requiredGrade && <Badge variant='outline'>{row.requiredGrade}</Badge>}
      </TableCell>
      <TableCell>{row.roleStatus && <StatusBadge status={row.roleStatus} />}</TableCell>
      <TableCell>
        {row.assignedMember ? (
          <div className='font-medium'>{row.assignedMember}</div>
        ) : (
          <span className='text-muted-foreground'>Unassigned</span>
        )}
      </TableCell>
      <TableCell>{row.allocation && `${row.allocation}%`}</TableCell>
      <TableCell>
        {row.needsHire !== undefined && (
          <Badge variant={row.needsHire ? 'destructive' : 'secondary'} className='text-xs'>
            {row.needsHire ? 'Yes' : 'No'}
          </Badge>
        )}
      </TableCell>

      {showActions && (
        <TableCell>
          {row.roleId && row.roleStatus === 'Open' && (
            <div className='flex flex-col gap-1'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleUpdateRole(row.opportunityId, row.roleId!, 'Won')}
                className='text-xs h-6 text-emerald-600 border-emerald-200 hover:bg-emerald-50'
              >
                <CheckCircle className='h-3 w-3 mr-1' />
                Won
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleUpdateRole(row.opportunityId, row.roleId!, 'Staffed')}
                className='text-xs h-6 text-green-600 border-green-200 hover:bg-green-50'
              >
                <UserCheck className='h-3 w-3 mr-1' />
                Staffed
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleUpdateRole(row.opportunityId, row.roleId!, 'Lost')}
                className='text-xs h-6 text-gray-600 border-gray-200 hover:bg-gray-50'
              >
                <XCircle className='h-3 w-3 mr-1' />
                Lost
              </Button>
            </div>
          )}
        </TableCell>
      )}

      {showActions && row.isFirstRowForOpportunity && (
        <TableCell rowSpan={row.rowSpan} className='align-top'>
          <div className='flex flex-col gap-1'>
            <Button size='sm' variant='outline' onClick={() => handleAddRole(row.opportunityId)} className='text-xs h-6'>
              <Plus className='h-3 w-3 mr-1' />
              Add Role
            </Button>
            {row.opportunityStatus === 'In Progress' && (
              <Button
                size='sm'
                variant='secondary'
                onClick={() => handleMoveToHold(row.opportunityId)}
                className='text-xs h-6'
              >
                Hold
              </Button>
            )}
            {row.opportunityStatus === 'On Hold' && (
              <Button
                size='sm'
                variant='default'
                onClick={() => handleMoveToInProgress(row.opportunityId)}
                className='text-xs h-6'
              >
                Resume
              </Button>
            )}
            {(row.opportunityStatus === 'In Progress' || row.opportunityStatus === 'On Hold') && (
              <Button
                size='sm'
                variant='default'
                onClick={() => handleMoveToCompleted(row.opportunityId)}
                className='text-xs h-6'
              >
                Complete
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}; 