import { format } from 'date-fns';

export const isOpportunityActiveByProbability = (probability: number): boolean => {
  return probability >= 80;
};

export const shouldAutoActivate = (probability: number, currentlyActive: boolean): boolean => {
  // Auto-activate if probability >= 80% and not currently active
  return probability >= 80 && !currentlyActive;
};

export const formatActivatedDate = (activatedAt?: string | null): string => {
  if (!activatedAt) return 'Not activated';
  
  try {
    const date = new Date(activatedAt);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const getActiveStatusConfig = (isActive: boolean) => {
  return {
    label: isActive ? 'Active' : 'Inactive',
    colorClass: isActive ? 'text-green-600' : 'text-gray-500',
    bgClass: isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200',
    badgeClass: isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600',
  };
}; 