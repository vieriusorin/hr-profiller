'use client';

import { useQueryState, createParser } from 'nuqs';
import { ViewMode } from '@/components/opportunities/components/view-toggle/types';

export const parseAsViewMode = createParser({
  parse: (value: string): ViewMode => {
    if (value === 'cards' || value === 'table' || value === 'gantt') {
      return value as ViewMode;
    }
    return 'cards';
  },
  serialize: (value: ViewMode) => value,
});

export interface UseOpportunityViewReturn {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
}

export const useOpportunityView = (): UseOpportunityViewReturn => {
  const [currentView, setCurrentView] = useQueryState(
    'view',
    parseAsViewMode.withDefault('cards')
  );

  return {
    currentView,
    setCurrentView,
  };
}; 