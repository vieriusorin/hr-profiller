import * as React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/shared/components/status-badge';
import { CountdownBadge } from '@/shared/components/countdown-badge';
import { ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { OpportunityCardHeaderProps } from '../types';
import { OpportunityStatus } from '@/app/shared/schemas/base-schemas';

export const OpportunityCardHeader: React.FC<OpportunityCardHeaderProps> = ({
  opportunityName,
  status,
  expectedStartDate,
  isExpanded,
  onToggleExpanded,
  onEditClick,
  actions,
}: OpportunityCardHeaderProps) => {
  return (
    <CardHeader>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={onToggleExpanded} className='border-1 border-gray-200'>
            {isExpanded ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
          <CardTitle className='text-lg flex items-center gap-2'>
            <span
              className='cursor-pointer underline decoration-dotted underline-offset-4'
              onClick={onEditClick}
            >
              {opportunityName}
            </span>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 p-0'
              onClick={onEditClick}
              aria-label='Edit Opportunity'
            >
              <Pencil className='h-4 w-4' />
            </Button>
          </CardTitle>
          <StatusBadge status={status as OpportunityStatus} />
          <CountdownBadge startDate={expectedStartDate} size='md' />
        </div>
        {actions && <div className='flex items-center gap-2'>{actions}</div>}
      </div>
    </CardHeader>
  );
}; 