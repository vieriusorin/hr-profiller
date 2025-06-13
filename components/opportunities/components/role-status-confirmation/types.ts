import React from 'react';

export interface RoleStatusConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  status: 'Won' | 'Staffed' | 'Lost';
  roleName?: string;
}

export interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
  buttonColor: string;
}

export type RoleStatusType = 'Won' | 'Staffed' | 'Lost'; 