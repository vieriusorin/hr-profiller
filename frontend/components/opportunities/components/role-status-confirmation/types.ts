import { RoleStatus } from '@/lib/types';
import React from 'react';

export interface RoleStatusConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  status: RoleStatus;
  roleName?: string;
}

export interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
  buttonColor: string;
}
