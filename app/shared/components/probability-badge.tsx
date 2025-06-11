'use client';

import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';

interface ProbabilityBadgeProps {
  probability: number;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const getProbabilityConfig = (probability: number) => {
  if (probability >= 76) {
    return {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'High',
      textColor: 'text-yellow-600'
    };
  } else if (probability >= 51) {
    return {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Medium',
      textColor: 'text-yellow-600'
    };
  } else if (probability >= 26) {
    return {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      label: 'Low',
      textColor: 'text-orange-600'
    };
  } else {
    return {
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'Very Low',
      textColor: 'text-red-600'
    };
  }
};

export const ProbabilityBadge = ({ 
  probability, 
  showIcon = true, 
  size = 'default' 
}: ProbabilityBadgeProps) => {
  const config = getProbabilityConfig(probability);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <div className='flex items-center gap-1'>
      {showIcon && <Briefcase className={`h-3 w-3 ${config.textColor}`} />}
      <Badge 
        variant='outline' 
        className={`${config.color} ${sizeClasses[size]} font-medium border`}
      >
        {probability}%
      </Badge>
      <span className={`text-xs ${config.textColor} font-medium`}>
        {config.label}
      </span>
    </div>
  );
}; 
