'use client';

import { z } from 'zod';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface FilterValidationDisplayProps {
  isValid: boolean;
  errors?: z.ZodError;
  className?: string;
}

export const FilterValidationDisplay = ({ 
  isValid, 
  errors, 
  className 
}: FilterValidationDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isValid || !errors) {
    return null;
  }

  const formatErrors = () => {
    if (!errors) return [];
    
    return errors.issues.map((issue, index) => ({
      id: index,
      path: issue.path.join('.') || 'root',
      message: issue.message,
      code: issue.code,
    }));
  };

  const formattedErrors = formatErrors();

  if (process.env.NODE_ENV !== 'development') {
    // Only show a simple indicator in production
    return (
      <div className={`text-amber-600 text-xs flex items-center gap-1 ${className}`}>
        <AlertTriangle className='h-3 w-3' />
        Filter validation warnings detected
      </div>
    );
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
            onClick={() => setIsExpanded(!isExpanded)}
            className='h-6 px-2 text-xs text-amber-700 hover:text-amber-900'
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>
      
      {isExpanded && formattedErrors.length > 0 && (
        <div className='mt-2 space-y-1'>
          {formattedErrors.map((error) => (
            <div 
              key={error.id} 
              className='text-xs bg-white rounded border border-amber-200 p-2'
            >
              <div className='font-medium text-amber-800'>
                {error.path}: {error.code}
              </div>
              <div className='text-amber-700 mt-1'>
                {error.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 