'use client';

import { CheckCircle, XCircle, AlertCircle, UserCheck } from 'lucide-react';
import { RoleStatus } from '../types';

interface RoleStatusIconProps {
  status: RoleStatus;
}

export const RoleStatusIcon = ({ status }: RoleStatusIconProps) => {
  switch (status) {
    case 'Won':
      return <CheckCircle className='h-4 w-4 text-emerald-600' />;
    case 'Lost':
      return <XCircle className='h-4 w-4 text-gray-600' />;
    case 'Staffed':
      return <UserCheck className='h-4 w-4 text-green-600' />;
    default:
      return <AlertCircle className='h-4 w-4 text-red-600' />;
  }
}; 