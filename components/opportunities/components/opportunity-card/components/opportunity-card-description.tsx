import { CardDescription } from '@/components/ui/card';
import { ProbabilityBadge } from '@/shared/components/probability-badge';
import { Building, Calendar } from 'lucide-react';

interface OpportunityCardDescriptionProps {
  clientName: string;
  expectedStartDate: string;
  probability: number;
}

export const OpportunityCardDescription = ({
  clientName,
  expectedStartDate,
  probability,
}: OpportunityCardDescriptionProps) => {
  return (
    <CardDescription className='flex items-center gap-4 text-sm px-6'>
      <span className='flex items-center gap-1'>
        <Building className='h-3 w-3' />
        {clientName}
      </span>
      <span className='flex items-center gap-1'>
        <Calendar className='h-3 w-3' />
        Start: {expectedStartDate}
      </span>
      <ProbabilityBadge probability={probability} size='sm' />
    </CardDescription>
  );
}; 