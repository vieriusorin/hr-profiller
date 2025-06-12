import { differenceInWeeks } from 'date-fns';

export type UrgencyLevel = 'urgent' | 'warning' | 'safe';

interface UrgencyConfig {
  colorClass: string;
  label: string;
  bgClass: string;
  textClass: string;
}

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
