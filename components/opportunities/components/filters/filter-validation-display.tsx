import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FilterValidationDisplayProps } from './types';
import { useFilterValidationDisplay } from './hooks/use-filter-validation-display';

export const FilterValidationDisplay = ({ isValid, errors, className }: FilterValidationDisplayProps) => {
  const {
    formattedErrors,
    isExpanded,
    toggleExpanded,
    shouldRender,
  } = useFilterValidationDisplay({ isValid, errors });

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`border border-amber-200 bg-amber-50 rounded-md p-2 ${className}`}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-amber-700 text-sm'>
          <AlertTriangle className='h-4 w-4' />
          <span>Filter Validation Issues ({formattedErrors.length})</span>
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleExpanded}
            className='h-6 px-2 text-xs text-amber-700 hover:text-amber-900'
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>

      {isExpanded && formattedErrors.length > 0 && (
        <div className='mt-2 space-y-1'>
          {formattedErrors.map((error) => (
            <div key={error.id} className='text-xs bg-white rounded border border-amber-200 p-2'>
              <div className='font-medium text-amber-800'>
                {error.path}: {error.code}
              </div>
              <div className='text-amber-700 mt-1'>{error.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 
