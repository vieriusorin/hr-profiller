'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle, UserCheck, XCircle } from 'lucide-react';
import { StatusBadge } from '../../../../shared/components/status-badge';
import { RoleStatusIcon } from '../../../../shared/components/role-status-icon';
import { useRoleCard } from './hooks/useRoleCard';
import { RoleCardProps } from './types';

export const RoleCard = ({ role, showActions = true, onUpdateStatus }: RoleCardProps) => {
  const { handleStatusUpdate } = useRoleCard({
    roleId: role.id,
    onUpdateStatus,
  });

  return (
    <Card className='p-4 bg-gray-50'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div>
          <Label className='text-sm font-medium'>Role</Label>
          <p className='text-sm'>{role.roleName}</p>
        </div>
        <div>
          <Label className='text-sm font-medium'>Required Grade</Label>
          <p className='text-sm'>{role.requiredGrade}</p>
        </div>
        <div>
          <Label className='text-sm font-medium'>Status</Label>
          <div className='mt-1 flex items-center gap-2'>
            <RoleStatusIcon status={role.status} />
            <StatusBadge status={role.status} />
          </div>
        </div>
        <div>
          <Label className='text-sm font-medium'>Needs Hire?</Label>
          <div className='mt-1'>
            <Badge className={role.needsHire ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
              {role.needsHire ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Role Status Actions */}
      {showActions && role.status === 'Open' && (
        <div className='mt-4 pt-3 border-t border-gray-200'>
          <Label className='text-sm font-medium mb-2 block'>Update Role Status:</Label>
          <div className='flex gap-2'>
            <Button 
              size='sm' 
              variant='outline'
              className='text-emerald-600 border-emerald-200 hover:bg-emerald-50'
              onClick={() => handleStatusUpdate('Won')}
            >
              <CheckCircle className='h-3 w-3 mr-1' />
              Won
            </Button>
            <Button 
              size='sm' 
              variant='outline'
              className='text-green-600 border-green-200 hover:bg-green-50'
              onClick={() => handleStatusUpdate('Staffed')}
            >
              <UserCheck className='h-3 w-3 mr-1' />
              Staffed
            </Button>
            <Button 
              size='sm' 
              variant='outline'
              className='text-gray-600 border-gray-200 hover:bg-gray-50'
              onClick={() => handleStatusUpdate('Lost')}
            >
              <XCircle className='h-3 w-3 mr-1' />
              Lost
            </Button>
          </div>
          <p className='text-xs text-gray-500 mt-2'>
            💡 The opportunity will automatically move to "Completed" when all roles are resolved
          </p>
        </div>
      )}

      {role.assignedMember && (
        <div className='mt-4 p-3 bg-green-50 rounded-md'>
          <Label className='text-sm font-medium'>Assigned Member</Label>
          <p className='text-sm'>
            {role.assignedMember.fullName} ({role.assignedMember.actualGrade})
          </p>
          <p className='text-xs text-gray-600'>
            Available from: {role.assignedMember.availableFrom} | Allocation: {role.assignedMember.allocation}%
          </p>
        </div>
      )}

      {role.comments && (
        <div className='mt-4'>
          <Label className='text-sm font-medium'>Comments</Label>
          <p className='text-sm text-gray-600'>{role.comments}</p>
        </div>
      )}
    </Card>
  );
}; 