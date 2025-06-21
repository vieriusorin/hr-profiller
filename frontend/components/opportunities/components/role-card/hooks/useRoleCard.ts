import { RoleStatus } from '@/lib/types';
import { UseRoleCardProps, UseRoleCardReturn } from '../types';

export const useRoleCard = ({
  roleId,
  onUpdateStatus,
}: UseRoleCardProps): UseRoleCardReturn => {
  
  const handleStatusUpdate = (status: RoleStatus) => {
    onUpdateStatus?.(roleId, status);
  };

  return {
    handleStatusUpdate,
  };
}; 
