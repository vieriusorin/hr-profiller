'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Role } from '@/shared/types';
import { RoleForm } from '../forms/create-role-form';
import { useUpdateRoleMutation } from '../../hooks/use-opportunities-query';
import toast from 'react-hot-toast';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  role: Role;
}

export const EditRoleModal = ({ isOpen, onClose, opportunityId, role }: EditRoleModalProps) => {
  const { mutate: updateRole, isPending } = useUpdateRoleMutation();

  const handleSubmit = async (updatedRole: Role) => {
    const loadingToast = toast.loading('Updating role...');

    updateRole(
      { 
        opportunityId, 
        roleId: role.id, 
        roleData: {
          roleName: updatedRole.roleName,
          requiredGrade: updatedRole.requiredGrade,
          allocation: updatedRole.allocation,
          needsHire: updatedRole.needsHire,
          comments: updatedRole.comments
        }
      },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success(`Role "${updatedRole.roleName}" updated successfully!`);
          onClose();
        },
        onError: (error) => {
          toast.dismiss(loadingToast);
          toast.error(`Failed to update role: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error('Failed to update role:', error);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>
        <RoleForm
          mode='edit'
          initialData={role}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}; 