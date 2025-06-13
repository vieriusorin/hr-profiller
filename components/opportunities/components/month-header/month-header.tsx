import React from 'react';
import { Calendar } from 'lucide-react';

interface MonthHeaderProps {
  monthLabel: string;
  opportunityCount: number;
}

export const MonthHeader = ({ monthLabel, opportunityCount }: MonthHeaderProps) => {
  return (
    <div className='sticky top-0 z-20 flex items-center justify-center py-3 px-4 mb-6 bg-background/95 backdrop-blur-md border-b border-border/40 transition-all duration-200'>
      <div className='flex items-center gap-3 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border shadow-lg ring-1 ring-black/5'>
        <Calendar className='h-4 w-4 text-primary/70' />
        <span className='text-sm font-semibold text-foreground'>
          {monthLabel}
        </span>
        <span className='text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-full border'>
          {opportunityCount} {opportunityCount === 1 ? 'item' : 'items'}
        </span>
      </div>
    </div>
  );
}; 