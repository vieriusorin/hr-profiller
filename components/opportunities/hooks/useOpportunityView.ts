'use client';

import { useQueryState } from 'nuqs';
import { createParser } from 'nuqs';
import { ViewMode } from '@/components/opportunities/components/view-toggle/types';

// Create a parser for ViewMode with validation
export const parseAsViewMode = createParser({
  parse: (value: string): ViewMode => {
    if (value === 'cards' || value === 'table' || value === 'gantt') {
      return value as ViewMode;
    }
    return 'cards'; // default fallback
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