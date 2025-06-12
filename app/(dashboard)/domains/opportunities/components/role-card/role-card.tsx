'use client';

import { Card } from '@/components/ui/card';
import { RoleDetails } from './role-details';
import { RoleStatusActions } from './role-status-actions';
import { AssignedMemberInfo } from './assigned-member-info';
import { RoleComments } from './role-comments';
import { useRoleCard } from './hooks/useRoleCard';
import { RoleCardProps } from './types';
import { useState } from 'react';
import { EditRoleModal } from '../modals/edit-role-modal';

export const RoleCard = ({ role, showActions = true, onUpdateStatus, opportunityId }: RoleCardProps) => {
  const { handleStatusUpdate } = useRoleCard({
    roleId: role.id,
    onUpdateStatus,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleRoleNameClick = () => {
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Card className='p-4 bg-gray-50'>
        <RoleDetails 
          role={role} 
          onRoleNameClick={handleRoleNameClick}
        />

        <RoleStatusActions 
          status={role.status} 
          show={showActions} 
          onStatusUpdate={handleStatusUpdate} 
        />

        {role.assignedMember && <AssignedMemberInfo member={role.assignedMember} />}

        {role.comments && <RoleComments comments={role.comments} />}
      </Card>

      <EditRoleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        opportunityId={opportunityId}
        role={role}
      />
    </>
  );
}; 
