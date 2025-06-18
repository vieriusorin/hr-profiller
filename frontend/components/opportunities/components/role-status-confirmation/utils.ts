import { CheckCircle, UserCheck, XCircle } from 'lucide-react';
import { StatusConfig, RoleStatusType } from './types';

export const statusConfig: Record<RoleStatusType, StatusConfig> = {
  Won: {
    icon: CheckCircle,
    color: 'text-green-600',
    title: 'Mark Role as Won',
    description: 'This role has been successfully won and filled.',
    buttonColor: 'bg-green-600 hover:bg-green-700 text-white'
  },
  Staffed: {
    icon: UserCheck,
    color: 'text-black',
    title: 'Mark Role as Staffed',
    description: 'This role has been staffed with a candidate.',
    buttonColor: 'bg-primary hover:bg-yellow'
  },
  Lost: {
    icon: XCircle,
    color: 'text-red-600',
    title: 'Mark Role as Lost',
    description: 'This role has been lost and will not be filled.',
    buttonColor: 'bg-red-600 hover:bg-red-700 text-white'
  }
}; 