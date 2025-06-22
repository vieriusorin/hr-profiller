import { useState, useCallback } from 'react';
import { ConfirmationDialogState } from '../types';
import { RoleStatus } from '@/lib/types';

export const useOpportunityModals = () => {
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    status: 'Won',
    opportunityId: '',
    roleId: '',
    roleName: '',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditOpportunityModalOpen, setIsEditOpportunityModalOpen] = useState(false);

  const handleStatusClick = useCallback((
    opportunityId: string,
    roleId: string,
    status: RoleStatus,
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

  const handleCloseDialog = useCallback(() => {
    setConfirmationDialog((prev: ConfirmationDialogState) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirmStatusUpdate = useCallback((
    onUpdateRole: (opportunityId: string, roleId: string, status: RoleStatus) => void
  ) => {
    if (onUpdateRole) {
      onUpdateRole(
        confirmationDialog.opportunityId,
        confirmationDialog.roleId,
        confirmationDialog.status
      );
      handleCloseDialog();
    }
  }, [confirmationDialog, handleCloseDialog]);

  return {
    confirmationDialog,
    isEditModalOpen,
    isEditOpportunityModalOpen,
    setIsEditModalOpen,
    setIsEditOpportunityModalOpen,
    handleStatusClick,
    handleCloseDialog,
    handleConfirmStatusUpdate,
  };
}; 