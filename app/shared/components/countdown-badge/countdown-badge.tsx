import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CountdownBadgeProps } from './types';
import { useCountdownBadge } from './hooks/use-countdown-badge';

export const CountdownBadge = ({ 
  startDate, 
  size = 'md', 
  showIcon = true 
}: CountdownBadgeProps) => {
  const { countdown,variant, className, textSize, getIcon } = useCountdownBadge({ startDate, size, showIcon });

  const iconConfig = getIcon(showIcon, size);

  return (
    <Badge 
      variant={variant}
      className={`${className} ${textSize} flex items-center gap-1 font-medium`}
    >
      {iconConfig && React.createElement(iconConfig.icon, { className: iconConfig.className })}
      {countdown.display}
    </Badge>
  );
}; 