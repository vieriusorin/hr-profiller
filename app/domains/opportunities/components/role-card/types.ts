import { Role, RoleStatus } from '@/shared/types';

export interface RoleStatusActions {
  onUpdateStatus?: (roleId: number, status: RoleStatus) => void;
}

export interface RoleCardProps extends RoleStatusActions {
  role: Role;
  showActions?: boolean;
}

export interface UseRoleCardProps extends RoleStatusActions {
  roleId: number;
}

export interface UseRoleCardReturn {
  handleStatusUpdate: (status: RoleStatus) => void;
} 