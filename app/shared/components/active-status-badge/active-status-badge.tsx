import React from 'react';
import { CheckCircle, Circle, Zap } from 'lucide-react';
import { getActiveStatusConfig, formatActivatedDate } from '@/shared/lib/helpers/opportunity-status';

interface ActiveStatusBadgeProps {
  isActive: boolean;
  activatedAt?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showActivatedDate?: boolean;
  autoActivated?: boolean; // If it was auto-activated based on probability
  onToggle?: () => void; // Click handler for toggling status
  isLoading?: boolean; // Show loading state during API call
}

export const ActiveStatusBadge = ({ 
  isActive, 
  activatedAt, 
  size = 'sm',
  showActivatedDate = false,
  autoActivated = false,
  onToggle,
  isLoading = false
}: ActiveStatusBadgeProps) => {
  const config = getActiveStatusConfig(isActive);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const handleClick = () => {
    if (onToggle && !isLoading) {
      onToggle();
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <span 
        className={`inline-flex items-center gap-1 rounded-full font-medium border transition-all duration-200 ${config.badgeClass} ${sizeClasses[size]} ${
          onToggle ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleClick}
        title={onToggle ? `Click to ${isActive ? 'deactivate' : 'activate'}` : undefined}
      >
        {isActive ? (
          <>
            {autoActivated ? (
              <Zap className={`${iconSizes[size]} text-yellow-600`} />
            ) : (
              <CheckCircle className={iconSizes[size]} />
            )}
            {config.label}
          </>
        ) : (
          <>
            <Circle className={iconSizes[size]} />
            {config.label}
          </>
        )}
        {isLoading && (
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`} />
        )}
      </span>
      
      {showActivatedDate && activatedAt && (
        <span className='text-xs text-muted-foreground'>
          Activated: {formatActivatedDate(activatedAt)}
        </span>
      )}
    </div>
  );
}; 