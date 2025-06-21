'use client';

import { GanttChart } from './gantt-chart';
import { Opportunity } from '@/lib/types';

interface GanttChartWrapperProps {
  opportunities: Opportunity[];
}

export const GanttChartWrapper = ({ opportunities }: GanttChartWrapperProps) => {
  return (
    <div 
      className="w-full overflow-x-auto"
      style={{
        maxWidth: '100%',
      }}
    >
      <GanttChart opportunities={opportunities} />
    </div>
  );
}; 