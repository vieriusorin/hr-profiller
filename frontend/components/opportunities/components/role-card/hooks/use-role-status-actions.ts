import { useState } from 'react';
import { RoleStatus } from '@/lib/types';
import { ConfirmationDialogState, UseRoleStatusActionsProps } from '../types';

export const useRoleStatusActions = ({ onStatusUpdate }: UseRoleStatusActionsProps) => {
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    status: 'Won'
  });

  const handleStatusClick = (newStatus: RoleStatus) => {
    setConfirmationDialog({
      isOpen: true,
      status: newStatus
    });
  };

  const handleConfirm = () => {
    onStatusUpdate(confirmationDialog.status as RoleStatus);
  };

  const handleCloseDialog = () => {
    setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
  };

  return {
    confirmationDialog,
    handleStatusClick,
    handleConfirm,
    handleCloseDialog
  };
}; 