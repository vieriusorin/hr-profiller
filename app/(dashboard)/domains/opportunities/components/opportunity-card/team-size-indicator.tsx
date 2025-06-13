import { Users } from 'lucide-react';

interface TeamSizeIndicatorProps {
  filledRoles: number;
  totalRoles: number;
}

export const TeamSizeIndicator = ({ filledRoles, totalRoles }: TeamSizeIndicatorProps) => {
  if (totalRoles === 0) {
    return null;
  }

  return (
    <span className='flex items-center gap-1 text-sm text-gray-600'>
      <Users className='h-4 w-4' />
      <span>
        {filledRoles}/{totalRoles} roles filled
      </span>
    </span>
  );
}; 