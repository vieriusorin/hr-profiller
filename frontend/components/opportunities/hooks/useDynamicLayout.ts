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
  const getContainerClassName = () => {
    if (isGanttView) {
      return 'w-full p-2 md:p-4';
    } else {
      return 'mx-auto w-full p-6';
    }
  };

  return {
    containerClassName: getContainerClassName(),
    isGanttView,
    sidebarOpen,
  };
}; 