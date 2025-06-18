'use client';

import { Card } from '@/components/ui/card';
import { RoleDetails } from './role-details';
import { RoleStatusActions } from './role-status-actions';

import { RoleComments } from './role-comments';
import { useRoleCard } from './hooks/useRoleCard';
import { useRoleCardModal } from './hooks/use-role-card-modal';
import { RoleCardProps } from './types';
import { EditRoleModal } from '../modals/edit-role-modal';

export const RoleCard = ({ role, showActions = true, onUpdateStatus, opportunityId, opportunity }: RoleCardProps) => {
  const { handleStatusUpdate } = useRoleCard({
    roleId: role.id,
    onUpdateStatus,
  });

  const { isEditModalOpen, handleRoleNameClick, handleCloseModal } = useRoleCardModal();

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

        {/* TODO: Implement assigned member display based on assignedMemberIds */}

        {role.comments && <RoleComments comments={role.comments} />}
      </Card>

      <EditRoleModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        opportunityId={opportunityId}
        role={role}
        opportunity={opportunity}
      />
    </>
  );
}; 
