import * as React from 'react';

import {
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/shared/components/status-badge';
import { ProbabilityBadge } from '@/shared/components/probability-badge';
import { Building, Calendar, Plus, Users, CheckCircle, UserCheck, XCircle, MoreHorizontal } from 'lucide-react';
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

  // If this is an opportunity row, show opportunity data only
  if (row.isOpportunityRow) {
    return (
      <TableRow>
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
        
        {/* Empty cells for role-specific columns */}
        <TableCell className='text-muted-foreground italic text-center'>—</TableCell>
        <TableCell className='text-muted-foreground italic text-center'>—</TableCell>
        <TableCell className='text-muted-foreground italic text-center'>—</TableCell>
        <TableCell className='text-muted-foreground italic text-center'>—</TableCell>
        <TableCell className='text-muted-foreground italic text-center'>—</TableCell>
        <TableCell className='text-muted-foreground italic text-center'>—</TableCell>
        
        {/* Role Actions - empty for opportunity row */}
        {showActions && <TableCell className='text-muted-foreground italic text-center'>—</TableCell>}
        
        {/* Opportunity Actions */}
        {showActions && (
          <TableCell rowSpan={row.rowSpan} className='align-top'>
            <div className='flex gap-1 min-w-0'>
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
  }

  // If this is a role row, show role data with gray background
  return (
    <TableRow className='bg-gray-50/70'>
      {/* Skip opportunity columns as they're handled by rowSpan */}
      
      <TableCell>
        {row.roleName ? (
          <div className='font-medium'>{row.roleName}</div>
        ) : (
          <span className='text-muted-foreground italic'>No role name</span>
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

      {/* Role Actions */}
      {showActions && (
        <TableCell>
          {row.roleId && row.roleStatus === 'Open' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size='sm'
                  variant='outline'
                  className='h-6 w-6 p-0'
                >
                  <MoreHorizontal className='h-3 w-3' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-32'>
                <DropdownMenuItem 
                  onClick={() => handleUpdateRole(row.opportunityId, row.roleId!, 'Won')}
                  className='text-green-600'
                >
                  <CheckCircle className='h-3 w-3 mr-2 text-green-600' />
                  Won
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleUpdateRole(row.opportunityId, row.roleId!, 'Staffed')}
                  className='text-yellow-600'
                >
                  <UserCheck className='h-3 w-3 mr-2 text-yellow-600' />
                  Staffed
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleUpdateRole(row.opportunityId, row.roleId!, 'Lost')}
                  className='text-red-600'
                >
                  <XCircle className='h-3 w-3 mr-2 text-red-600' />
                  Lost
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      )}

      {/* Opportunity Actions - empty for role rows */}
      {showActions && <TableCell></TableCell>}
    </TableRow>
  );
}; 
