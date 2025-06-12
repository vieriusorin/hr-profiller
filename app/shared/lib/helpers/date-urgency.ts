import { differenceInWeeks, differenceInDays, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import { UrgencyConfig, UrgencyLevel } from '../../types';

export const getStartDateUrgency = (startDate: string): UrgencyLevel => {
  const today = new Date();
  const start = new Date(startDate);
  const weeksUntilStart = differenceInWeeks(start, today);

  if (weeksUntilStart <= 6) {
    return 'urgent';
  } else if (weeksUntilStart <= 8) {
    return 'warning';
  } else {
    return 'safe';
  }
};

export const getUrgencyConfig = (urgency: UrgencyLevel): UrgencyConfig => {
  switch (urgency) {
    case 'urgent':
      return {
        colorClass: 'border-red-200',
        label: 'Urgent',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700'
      };
    case 'warning':
      return {
        colorClass: 'border-amber-200',
        label: 'Warning',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-700'
      };
    case 'safe':
      return {
        colorClass: 'border-green-200',
        label: 'On Track',
        bgClass: 'bg-green-50',
        textClass: 'text-green-700'
      };
  }
};

export const getUrgencyTooltip = (startDate: string): string => {
  const urgency = getStartDateUrgency(startDate);
  const weeks = differenceInWeeks(new Date(startDate), new Date());
  
  switch (urgency) {
    case 'urgent':
      return `Urgent: ${weeks} weeks until start - Immediate action needed`;
    case 'warning':
      return `Warning: ${weeks} weeks until start - Planning needed soon`;
    case 'safe':
      return `On Track: ${weeks} weeks until start - Sufficient planning time`;
  }
};

export const getDaysUntilStart = (startDate: string): number => {
  const today = new Date();
  const start = new Date(startDate);
  return differenceInDays(start, today);
};

export const getCountdownDisplay = (startDate: string): {
  display: string;
  isOverdue: boolean;
  isToday: boolean;
  isInPast: boolean;
  urgency: UrgencyLevel;
} => {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDateOnly = new Date(start);
  startDateOnly.setHours(0, 0, 0, 0);
  
  const daysUntilStart = getDaysUntilStart(startDate);
  const urgency = getStartDateUrgency(startDate);
  const isInPast = isPast(startDateOnly);
  const isToday = daysUntilStart === 0;
  const isOverdue = isInPast && !isToday;

  if (isToday) {
    return {
      display: 'Starts Today!',
      isOverdue: false,
      isToday: true,
      isInPast: false,
      urgency
    };
  }
  
  if (isOverdue) {
    const daysPast = Math.abs(daysUntilStart);
    return {
      display: `${daysPast} day${daysPast !== 1 ? 's' : ''} overdue`,
      isOverdue: true,
      isToday: false,
      isInPast: true,
      urgency
    };
  }

  if (daysUntilStart === 1) {
    return {
      display: 'Starts Tomorrow',
      isOverdue: false,
      isToday: false,
      isInPast: false,
      urgency
    };
  }

  if (daysUntilStart <= 7) {
    return {
      display: `${daysUntilStart} days to start`,
      isOverdue: false,
      isToday: false,
      isInPast: false,
      urgency
    };
  }

  const weeks = Math.floor(daysUntilStart / 7);
  const remainingDays = daysUntilStart % 7;
  
  if (weeks === 1 && remainingDays === 0) {
    return {
      display: '1 week to start',
      isOverdue: false,
      isToday: false,
      isInPast: false,
      urgency
    };
  }
  
  if (remainingDays === 0) {
    return {
      display: `${weeks} weeks to start`,
      isOverdue: false,
      isToday: false,
      isInPast: false,
      urgency
    };
  }
  
  return {
    display: `${weeks}w ${remainingDays}d to start`,
    isOverdue: false,
    isToday: false,
    isInPast: false,
    urgency
  };
}; 
