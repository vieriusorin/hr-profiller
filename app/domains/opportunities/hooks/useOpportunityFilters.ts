import { useQueryStates } from 'nuqs';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Grade } from '@/shared/types';
import { 
  parseAsValidatedClient,
  parseAsValidatedGrades,
  parseAsValidatedNeedsHire 
} from './filter-parsers';
import { 
  validateOpportunityFilters,
  createSafeFilters,
} from './filter-validation';
import { z } from 'zod';

const filterParsers = {
  client: parseAsValidatedClient.withDefault(''),
  grades: parseAsValidatedGrades.withDefault([]),
  needsHire: parseAsValidatedNeedsHire.withDefault('all'),
};

export interface OpportunityFiltersState {
  client: string;
  grades: Grade[];
  needsHire: 'yes' | 'no' | 'all';
}

export interface UseOpportunityFiltersReturn {
  filters: OpportunityFiltersState;
  clientInput: string;
  updateFilters: (updates: Partial<OpportunityFiltersState>) => void;
  updateClientInput: (value: string) => void;
  updateGrades: (grades: Grade[]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  isFiltersValid: boolean;
  filterValidationErrors?: z.ZodError;
}

export const useOpportunityFilters = (): UseOpportunityFiltersReturn => {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    shallow: true,
    clearOnDefault: true,
  });

  const [clientInput, setClientInput] = useState(filters.client);
  const debouncedClientFilter = useDebounce(clientInput, 300);
  
  const isInitialMount = useRef(true);
  const lastDebouncedValue = useRef(debouncedClientFilter);

  const filterValidation = validateOpportunityFilters(filters);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastDebouncedValue.current = debouncedClientFilter;
      return;
    }

    if (debouncedClientFilter !== lastDebouncedValue.current) {
      lastDebouncedValue.current = debouncedClientFilter;
      
      const sanitizedClient = parseAsValidatedClient.parse(debouncedClientFilter);
      setFilters(prev => ({ ...prev, client: sanitizedClient }));
    }
  }, [debouncedClientFilter, setFilters]);

  // Only sync clientInput with URL state on external changes (like browser back/forward)
  // This effect should NOT trigger when we update the URL from debounced input
  useEffect(() => {
    // Only sync if the URL client filter differs from our current input
    // and it's not a change we just made through debouncing
    if (filters.client !== lastDebouncedValue.current && filters.client !== clientInput) {
      setClientInput(filters.client);
    }
  }, [filters.client]);

  const updateFilters = (updates: Partial<OpportunityFiltersState>) => {
    // Create safe filters with validation
    const safeUpdates = createSafeFilters({
      client: updates.client ?? filters.client,
      grades: updates.grades ?? filters.grades,
      needsHire: updates.needsHire ?? filters.needsHire,
    });
    
    setFilters((prev: OpportunityFiltersState) => ({
      ...prev,
      ...safeUpdates,
    }));
  };

  const updateClientInput = (value: string) => {
    const sanitizedValue = parseAsValidatedClient.parse(value);
    setClientInput(sanitizedValue);
  };

  const updateGrades = (grades: Grade[]) => {
    const validatedGrades = parseAsValidatedGrades.parse(grades.join(','));
    setFilters(prev => ({ ...prev, grades: validatedGrades }));
  };

  const clearFilters = () => {
    setClientInput('');
    
    // Use safe defaults
    const safeDefaults = createSafeFilters({
      client: '',
      grades: [],
      needsHire: 'all',
    });
    
    setFilters(safeDefaults);
  };
  
  const hasActiveFilters = 
    filters.client !== '' || 
    filters.grades.length > 0 || 
    filters.needsHire !== 'all';

  return {
    filters: filterValidation.isValid ? filterValidation.filters! : {
      client: '',
      grades: [],
      needsHire: 'all',
    },
    clientInput,
    updateFilters,
    updateClientInput,
    updateGrades,
    clearFilters,
    hasActiveFilters,
    isFiltersValid: filterValidation.isValid,
    filterValidationErrors: filterValidation.errors,
  };
}; 