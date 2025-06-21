import { Clock, AlertTriangle, Calendar } from 'lucide-react';
import { getCountdownDisplay } from '@/shared/lib/helpers/date-urgency';
import { CountdownBadgeProps } from '../types';

export const useCountdownBadge = ({
  startDate,
  size = 'md',
}: CountdownBadgeProps) => {
  const countdown = getCountdownDisplay(startDate);

  const getIcon = (showIcon: boolean, size: 'sm' | 'md' | 'lg') => {
    if (!showIcon) return null;

    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    if (countdown.isToday) {
      return { icon: Calendar, className: iconSize };
    }
    if (countdown.isOverdue) {
      return { icon: AlertTriangle, className: iconSize };
    }
    return { icon: Clock, className: iconSize };
  };

  const getVariantAndClasses = () => {
    if (countdown.isToday) {
      return {
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse'
      };
    }

    if (countdown.isOverdue) {
      return {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-200'
      };
    }

    switch (countdown.urgency) {
      case 'urgent':
        return {
          variant: 'secondary' as const,
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      case 'warning':
        return {
          variant: 'secondary' as const,
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'safe':
        return {
          variant: 'outline' as const,
          className: 'bg-green-50 text-green-700 border-green-200'
        };
      default:
        return {
          variant: 'default' as const,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  const { variant, className } = getVariantAndClasses();
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  return {
    countdown,
    variant,
    className,
    textSize,
    getIcon
  }

}