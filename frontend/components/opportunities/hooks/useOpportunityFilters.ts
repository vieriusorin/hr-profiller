import { useQueryStates } from 'nuqs';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { JobGrade } from '@/lib/backend-types/enums';
import {
  parseAsValidatedClient,
  parseAsValidatedGrades,
  parseAsValidatedNeedsHire,
  parseAsValidatedProbability
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
  probability: parseAsValidatedProbability.withDefault([0, 100]),
};

export interface OpportunityFiltersState {
  client: string;
  grades: JobGrade[];
  needsHire: 'yes' | 'no' | 'all';
  probability: [number, number];
}

export interface UseOpportunityFiltersReturn {
  filters: OpportunityFiltersState;
  clientInput: string;
  updateFilters: (updates: Partial<OpportunityFiltersState>) => void;
  updateClientInput: (value: string) => void;
  updateGrades: (grades: JobGrade[]) => void;
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

  useEffect(() => {
    if (filters.client !== lastDebouncedValue.current && filters.client !== clientInput) {
      setClientInput(filters.client);
    }
  }, [filters.client, clientInput]);

  const updateFilters = (updates: Partial<OpportunityFiltersState>) => {
    const safeUpdates = createSafeFilters({
      client: updates.client ?? filters.client,
      grades: updates.grades ?? filters.grades,
      needsHire: updates.needsHire ?? filters.needsHire,
      probability: updates.probability ?? filters.probability,
    });

    setFilters((prev: OpportunityFiltersState) => ({
      ...prev,
      ...safeUpdates,
    }));
  };

  const updateClientInput = (value: string) => {
    const sanitizedValue = parseAsValidatedClient.parse(value);
    setClientInput(sanitizedValue ?? '');
  };

  const updateGrades = (grades: JobGrade[]) => {
    const validatedGrades = parseAsValidatedGrades.parse(grades.join(','));
    setFilters(prev => ({ ...prev, grades: validatedGrades }));
  };

  const clearFilters = () => {
    setClientInput('');

    const safeDefaults = createSafeFilters({
      client: '',
      grades: [],
      needsHire: 'all',
      probability: [0, 100],
    });

    setFilters(safeDefaults);
  };

  const hasActiveFilters =
    filters.client !== '' ||
    filters.grades.length > 0 ||
    filters.needsHire !== 'all' ||
    (filters.probability && (filters.probability[0] !== 0 || filters.probability[1] !== 100));

  return {
    filters: filterValidation.isValid ? filterValidation.filters! : {
      client: '',
      grades: [],
      needsHire: 'all',
      probability: [0, 100],
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
