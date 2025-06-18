'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { ViewMode } from '@/components/opportunities/components/view-toggle/types';

export interface UseDynamicLayoutReturn {
  containerClassName: string;
  isGanttView: boolean;
  sidebarOpen: boolean;
}

export const useDynamicLayout = (currentView: ViewMode): UseDynamicLayoutReturn => {
  const { open: sidebarOpen } = useSidebar();
  const isGanttView = currentView === 'gantt';

  // Calculate container classes based on view
  const getContainerClassName = () => {
    if (isGanttView) {
      // For Gantt view, use minimal padding
      return 'w-full p-2 md:p-4';
    } else {
      // For cards/table views, use standard layout
      return 'mx-auto w-full p-6';
    }
  };

  return {
    containerClassName: getContainerClassName(),
    isGanttView,
    sidebarOpen,
  };
}; 