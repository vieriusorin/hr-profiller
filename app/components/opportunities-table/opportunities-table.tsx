'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/shared/components/status-badge';
import { Building, Calendar, Plus, Users, CheckCircle, UserCheck, XCircle } from 'lucide-react';
import type { Opportunity, OpportunityStatus, RoleStatus } from '@/shared/types';
import { ProbabilityBadge } from '@/shared/components/probability-badge';

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  showActions?: boolean;
  onAddRole?: (opportunityId: number) => void;
  onUpdateRole?: (opportunityId: number, roleId: number, status: string) => void;
  onMoveToHold?: (opportunityId: number) => void;
  onMoveToInProgress?: (opportunityId: number) => void;
}

interface FlattenedRow {
  opportunityId: number;
  opportunityName: string;
  clientName: string;
  expectedStartDate: string;
  probability: number;
  opportunityStatus: OpportunityStatus;
  rolesCount: number;
  hasHiringNeeds: boolean;
  roleId?: number;
  roleName?: string;
  requiredGrade?: string;
  roleStatus?: RoleStatus;
  assignedMember?: string;
  needsHire?: boolean;
  allocation?: number;
  isFirstRowForOpportunity: boolean;
  rowSpan: number;
}

export const OpportunitiesTable = ({
  opportunities,
  showActions = true,
  onAddRole,
  onUpdateRole,
  onMoveToHold,
  onMoveToInProgress,
}: OpportunitiesTableProps) => {
  // Flatten the data structure to create table rows
  const flattenedData: FlattenedRow[] = [];

  opportunities.forEach((opportunity) => {
    if (opportunity.roles.length === 0) {
      // If no roles, show just the opportunity
      flattenedData.push({
        opportunityId: opportunity.id,
        opportunityName: opportunity.opportunityName,
        clientName: opportunity.clientName,
        expectedStartDate: opportunity.expectedStartDate,
        probability: opportunity.probability,
        opportunityStatus: opportunity.status,
        rolesCount: 0,
        hasHiringNeeds: false,
        isFirstRowForOpportunity: true,
        rowSpan: 1,
      });
    } else {
      // If has roles, create a row for each role
      opportunity.roles.forEach((role, index) => {
        flattenedData.push({
          opportunityId: opportunity.id,
          opportunityName: opportunity.opportunityName,
          clientName: opportunity.clientName,
          expectedStartDate: opportunity.expectedStartDate,
          probability: opportunity.probability,
          opportunityStatus: opportunity.status,
          rolesCount: opportunity.roles.length,
          hasHiringNeeds: opportunity.roles.some(r => r.needsHire),
          roleId: role.id,
          roleName: role.roleName,
          requiredGrade: role.requiredGrade,
          roleStatus: role.status,
          assignedMember: role.assignedMember?.fullName,
          needsHire: role.needsHire,
          allocation: role.assignedMember?.allocation,
          isFirstRowForOpportunity: index === 0,
          rowSpan: opportunity.roles.length,
        });
      });
    }
  });

  const handleMoveToHold = (opportunityId: number) => {
    onMoveToHold?.(opportunityId);
  };

  const handleMoveToInProgress = (opportunityId: number) => {
    onMoveToInProgress?.(opportunityId);
  };

  const handleAddRole = (opportunityId: number) => {
    onAddRole?.(opportunityId);
  };

  const handleUpdateRole = (opportunityId: number, roleId: number, status: string) => {
    onUpdateRole?.(opportunityId, roleId, status);
  };

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
            {showActions && <TableHead className='w-[140px]'>Role Actions</TableHead>}
            {showActions && <TableHead className='w-[120px]'>Opp. Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {flattenedData.map((row, index) => (
            <TableRow key={`${row.opportunityId}-${row.roleId || 'no-role'}-${index}`}>
              {/* Opportunity details (only show on first row) */}
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
                      {row.expectedStartDate}
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

              {/* Role details */}
              <TableCell>
                {row.roleName ? (
                  <div className='font-medium'>{row.roleName}</div>
                ) : (
                  <span className='text-muted-foreground italic'>No roles added</span>
                )}
              </TableCell>
              <TableCell>
                {row.requiredGrade && (
                  <Badge variant='outline'>{row.requiredGrade}</Badge>
                )}
              </TableCell>
              <TableCell>
                {row.roleStatus && (
                  <StatusBadge status={row.roleStatus} />
                )}
              </TableCell>
              <TableCell>
                {row.assignedMember ? (
                  <div className='font-medium'>{row.assignedMember}</div>
                ) : (
                  <span className='text-muted-foreground'>Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                {row.allocation && `${row.allocation}%`}
              </TableCell>
              <TableCell>
                {row.needsHire !== undefined && (
                  <Badge 
                    variant={row.needsHire ? 'destructive' : 'secondary'}
                    className='text-xs'
                  >
                    {row.needsHire ? 'Yes' : 'No'}
                  </Badge>
                )}
              </TableCell>

              {/* Role Actions */}
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

              {/* Opportunity Actions (only show on first row) */}
              {showActions && row.isFirstRowForOpportunity && (
                <TableCell rowSpan={row.rowSpan} className='align-top'>
                  <div className='flex flex-col gap-1'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleAddRole(row.opportunityId)}
                      className='text-xs h-6'
                    >
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
                  </div>
                </TableCell>
              )}
            </TableRow>
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