import { useState, useCallback } from 'react';
import { RoleStatus } from '@/shared/types';

export const useRoleRow = (onUpdateRole: (opportunityId: string, roleId: string, status: RoleStatus) => void) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    status: 'Won' | 'Staffed' | 'Lost';
    opportunityId: string;
    roleId: string;
    roleName?: string;
  }>({
    isOpen: false,
    status: 'Won',
    opportunityId: '',
    roleId: '',
    roleName: '',
  });

  const handleRoleNameClick = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleStatusClick = useCallback((
    opportunityId: string,
    roleId: string,
    status: 'Won' | 'Staffed' | 'Lost',
    roleName?: string
  ) => {
    setConfirmationDialog({
      isOpen: true,
      status,
      opportunityId,
      roleId,
      roleName,
    });
  }, []);

  const handleConfirmStatusUpdate = useCallback(() => {
    onUpdateRole(
      confirmationDialog.opportunityId,
      confirmationDialog.roleId,
      confirmationDialog.status
    );
    handleCloseDialog();
  }, [confirmationDialog, onUpdateRole]);

  const handleCloseDialog = useCallback(() => {
    setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    isEditModalOpen,
    confirmationDialog,
    handleRoleNameClick,
    handleCloseEditModal,
    handleStatusClick,
    handleConfirmStatusUpdate,
    handleCloseDialog,
  };
}; 