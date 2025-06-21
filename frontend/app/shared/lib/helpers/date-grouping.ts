import { format, parseISO, isValid } from 'date-fns';
import { MonthGroup, Opportunity } from '@/lib/types';

export const groupOpportunitiesByMonth = (opportunities: Opportunity[]): MonthGroup[] => {
  // Sort opportunities by createdAt date in descending order (newest first)
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const dateA = a.createdAt ? parseISO(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? parseISO(b.createdAt) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  // Group opportunities by month
  const monthGroups = new Map<string, Opportunity[]>();

  sortedOpportunities.forEach((opportunity) => {
    let monthKey: string;

    if (opportunity.createdAt) {
      const date = parseISO(opportunity.createdAt);
      if (isValid(date)) {
        monthKey = format(date, 'yyyy-MM');
      } else {
        monthKey = '0000-00'; // Unknown date group
      }
    } else {
      monthKey = '0000-00'; // Unknown date group
    }
    
    if (!monthGroups.has(monthKey)) {
      monthGroups.set(monthKey, []);
    }
    
    monthGroups.get(monthKey)!.push(opportunity);
  });

  // Convert map to array and format month labels
  return Array.from(monthGroups.entries()).map(([monthKey, opportunities]) => {
    let monthLabel: string;
    
    if (monthKey === '0000-00') {
      monthLabel = 'Unknown Date';
    } else {
      const date = parseISO(`${monthKey}-01`);
      monthLabel = format(date, 'MMMM yyyy');
    }
    
    return {
      monthKey,
      monthLabel,
      opportunities,
    };
  });
};

export const getMonthLabel = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return format(new Date(), 'MMMM yyyy');
    }
    return format(date, 'MMMM yyyy');
  } catch {
    return format(new Date(), 'MMMM yyyy');
  }
}; 