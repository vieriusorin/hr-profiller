import { useState, useMemo } from 'react';
import type { FormattedError, UseFilterValidationDisplayParams } from '../types';

export const useFilterValidationDisplay = ({ isValid, errors }: UseFilterValidationDisplayParams) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedErrors: FormattedError[] = useMemo(() => {
    if (!errors) return [];

    return errors.issues.map((issue, index) => ({
      id: index.toString(),
      path: issue.path.join('.') || 'root',
      message: issue.message,
      code: issue.code,
    }));
  }, [errors]);

  const shouldRender = !isValid && !!errors;
  const isProduction = process.env.NODE_ENV !== 'development';

  const toggleExpanded = () => setIsExpanded((prev: boolean) => !prev);

  return {
    formattedErrors,
    isExpanded,
    toggleExpanded,
    shouldRender,
    isProduction,
  } as const;
}; 
