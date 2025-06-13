import { CardDescription } from '@/components/ui/card';
import { ProbabilityBadge } from '@/shared/components/probability-badge';
import { ActiveStatusBadge } from '@/shared/components/active-status-badge/active-status-badge';
import { Building, Calendar, Clock } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { isOpportunityActiveByProbability } from '@/shared/lib/helpers/opportunity-status';

interface OpportunityCardDescriptionProps {
  clientName: string;
  expectedStartDate: string;
  probability: number;
  createdAt?: string;
  isActive?: boolean;
  activatedAt?: string | null;
  onToggleActive?: () => Promise<void>;
  isTogglingActive?: boolean;
}

export const OpportunityCardDescription = ({
  clientName,
  expectedStartDate,
  probability,
  createdAt,
  isActive = false,
  activatedAt,
  onToggleActive,
  isTogglingActive = false,
}: OpportunityCardDescriptionProps) => {
  const formatCreatedDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Unknown';
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  // Check if it was auto-activated based on probability
  const autoActivated = isActive && isOpportunityActiveByProbability(probability);

  return (
    <CardDescription className='flex items-center gap-4 text-sm px-6 flex-wrap'>
      <span className='flex items-center gap-1'>
        <Building className='h-3 w-3' />
        {clientName}
      </span>
      <span className='flex items-center gap-1'>
        <Calendar className='h-3 w-3' />
        Start: {expectedStartDate}
      </span>
      <span className='flex items-center gap-1 text-muted-foreground'>
        <Clock className='h-3 w-3' />
        Created: {formatCreatedDate(createdAt)}
      </span>
      <ProbabilityBadge probability={probability} size='sm' />
      <ActiveStatusBadge 
        isActive={isActive} 
        activatedAt={activatedAt}
        autoActivated={autoActivated}
        size='sm'
        onToggle={onToggleActive}
        isLoading={isTogglingActive}
      />
    </CardDescription>
  );
}; 