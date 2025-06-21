import { EmployeeProfile, Role, Opportunity } from '@/lib/api-client';
import { RoleStatus } from '@/lib/types';

export interface RoleStatusActions {
  onUpdateStatus?: (roleId: string, status: RoleStatus) => void;
}

export interface RoleCardProps extends RoleStatusActions {
  role: Role;
  showActions?: boolean;
  opportunityId: string;
  opportunity: Opportunity;
}

export interface UseRoleCardProps extends RoleStatusActions {
  roleId: string;
}

export interface UseRoleCardReturn {
  handleStatusUpdate: (status: RoleStatus) => void;
}

export interface RoleStatusActionsProps {
  status: RoleStatus;
  show: boolean;
  onStatusUpdate: (status: RoleStatus) => void;
}

export interface AssignedMemberInfoProps {
  employee: EmployeeProfile;
}

export type UseRoleStatusActionsProps = {
  onStatusUpdate: (status: RoleStatus) => void;
}

export type ConfirmationDialogState = {
  isOpen: boolean;
  status: RoleStatus;
}


export type RoleDetailsProps = {
  role: Role;
  onRoleNameClick: () => void;
}
