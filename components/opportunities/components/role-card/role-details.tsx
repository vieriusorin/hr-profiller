import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RoleStatusIcon } from '@/shared/components/role-status-icon';
import { StatusBadge } from '@/shared/components/status-badge';
import { RoleDetailsProps } from './types';

export const RoleDetails = ({ role, onRoleNameClick }: RoleDetailsProps) => (
  <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
    <div>
      <Label className='text-sm font-medium'>Role</Label>
      <p 
        className='text-sm cursor-pointer hover:text-blue-600 transition-colors'
        onClick={(e) => {
          e.stopPropagation();
          onRoleNameClick();
        }}
      >
        {role.roleName}
      </p>
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
      <Label className='text-sm font-medium'>Allocation</Label>
      <p className='text-sm font-semibold'>
        {(role.allocation !== undefined && role.allocation !== null) ? `${role.allocation}%` : '100%'}
      </p>
    </div>
    <div>
      <Label className='text-sm font-medium'>Needs Hire?</Label>
      <div className='mt-1'>
        <Badge className={role.needsHire ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-green-800'}>
          {role.needsHire ? 'Yes' : 'No'}
        </Badge>
      </div>
    </div>
  </div>
); 
