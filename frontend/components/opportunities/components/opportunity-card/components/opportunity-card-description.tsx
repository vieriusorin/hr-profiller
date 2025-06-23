import { CardDescription } from '@/components/ui/card';
import { ProbabilityBadge } from '@/shared/components/probability-badge';
import { Building, Calendar, Clock } from 'lucide-react';
import { OpportunityCardDescriptionProps } from '../types';
import { formatCreatedDate } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';

const formatExpectedDate = (dateString?: string | null) => {
  if (!dateString) return 'TBD';
  
  try {
    // Handle both ISO datetime strings and YYYY-MM-DD date strings
    const date = parseISO(dateString);
    if (!isValid(date)) return 'TBD';
    return format(date, 'MMM dd, yyyy');
  } catch {
    return 'TBD';
  }
};

export const OpportunityCardDescription = ({
  clientName,
  expectedStartDate,
  probability,
  createdAt,
}: OpportunityCardDescriptionProps) => {
  console.log('🔍 [OpportunityCardDescription] expectedStartDate:', expectedStartDate, typeof expectedStartDate);
  
  return (
    <CardDescription className='flex items-center gap-4 text-sm px-6 flex-wrap'>
      <span className='flex items-center gap-1'>
        <Building className='h-3 w-3' />
        {clientName}
      </span>
      <span className='flex items-center gap-1'>
        <Calendar className='h-3 w-3' />
        Start: {formatExpectedDate(expectedStartDate)}
      </span>
      <span className='flex items-center gap-1 text-muted-foreground'>
        <Clock className='h-3 w-3' />
        Created: {formatCreatedDate(createdAt)}
      </span>
      <ProbabilityBadge probability={probability} size='sm' />
    </CardDescription>
  );
}; 