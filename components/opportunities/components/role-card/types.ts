import { Member, Role, RoleStatus, Opportunity } from '@/shared/types';

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
  member: Member;
}

export type UseRoleStatusActionsProps = {
  onStatusUpdate: (status: RoleStatus) => void;
}

export type ConfirmationDialogState = {
  isOpen: boolean;
  status: 'Won' | 'Staffed' | 'Lost';
}


export type RoleDetailsProps = {
  role: Role;
  onRoleNameClick: () => void;
}
