export type { OpportunityFiltersState } from '../../hooks/useOpportunityFilters';

import type { ZodError } from 'zod';
import type { Grade } from '@/shared/types';

export interface FormattedError {
  id: string;
  path: string;
  message: string;
  code: string;
}

export type FilterValidationDisplayProps = {
  isValid: boolean;
  errors?: ZodError;
  className?: string;
}

export interface GradeMultiSelectProps {
  selectedGrades: Grade[];
  onGradesChange: (grades: Grade[]) => void;
  placeholder?: string;
  className?: string;
} 

export interface UseGradeMultiSelectParams {
  selectedGrades: Grade[];
  placeholder: string;
}

export interface UseGradeMultiSelectHandlers {
  onGradesChange: (grades: Grade[]) => void;
}

export interface UseFilterValidationDisplayParams {
  isValid: boolean;
  errors?: ZodError;
}

export interface ProbabilitySliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

export interface UseProbabilitySliderParams {
  value: [number, number];
}

export interface UseProbabilitySliderHandlers {
  onChange: (value: [number, number]) => void;
}
