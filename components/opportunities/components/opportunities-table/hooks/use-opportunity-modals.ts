import { useState } from 'react';
import { ConfirmationDialogState } from '../types';

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

  const handleStatusClick = (
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
  };

  const handleCloseDialog = () => {
    setConfirmationDialog((prev: ConfirmationDialogState) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmStatusUpdate = (
    onUpdateRole: (opportunityId: string, roleId: string, status: 'Won' | 'Staffed' | 'Lost') => void
  ) => {
    if (onUpdateRole) {
      onUpdateRole(
        confirmationDialog.opportunityId,
        confirmationDialog.roleId,
        confirmationDialog.status
      );
      handleCloseDialog();
    }
  };

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