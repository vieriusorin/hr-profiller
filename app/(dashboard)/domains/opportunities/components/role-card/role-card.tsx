'use client';

import { Card } from '@/components/ui/card';
import { RoleDetails } from './role-details';
import { RoleStatusActions } from './role-status-actions';
import { AssignedMemberInfo } from './assigned-member-info';
import { RoleComments } from './role-comments';
import { useRoleCard } from './hooks/useRoleCard';
import { RoleCardProps } from './types';

export const RoleCard = ({ role, showActions = true, onUpdateStatus }: RoleCardProps) => {
  const { handleStatusUpdate } = useRoleCard({
    roleId: role.id,
    onUpdateStatus,
  });

  return (
    <Card className='p-4 bg-gray-50'>
      <RoleDetails role={role} />

      <RoleStatusActions 
        status={role.status} 
        show={showActions} 
        onStatusUpdate={handleStatusUpdate} 
      />

      {role.assignedMember && <AssignedMemberInfo member={role.assignedMember} />}

      {role.comments && <RoleComments comments={role.comments} />}
    </Card>
  );
}; 