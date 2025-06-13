'use client';

import { useState } from 'react';
import { ApiValidationError } from '@/shared/lib/api/validated-api';

interface ValidationErrorDisplayProps {
  error: ApiValidationError | Error;
  onRetry?: () => void;
  fallbackData?: any[];
}

export const ValidationErrorDisplay = ({ 
  error, 
  onRetry,
  fallbackData
}: ValidationErrorDisplayProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const isValidationError = error instanceof ApiValidationError;

  return (
    <div className='my-4 p-4 border border-red-200 bg-red-50 rounded-lg'>
      <div className='flex items-center justify-between mb-2'>
        <h3 className='font-medium text-red-800'>
          {isValidationError ? `Data Validation Error` : 'Error'}
        </h3>
        <div className='flex gap-2'>
          {isValidationError && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className='text-xs text-red-600 hover:text-red-800 underline'
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className='text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded'
            >
              Retry
            </button>
          )}
        </div>
      </div>
      
      <p className='text-red-700 text-sm'>
        {isValidationError 
          ? `Failed to validate data from ${error.endpoint}: ${error.message}`
          : error.message || 'Something went wrong'
        }
      </p>

      {isValidationError && showDetails && (
        <details className='mt-3 bg-red-100 p-3 rounded border border-red-300'>
          <summary className='cursor-pointer text-sm font-medium text-red-800'>
            Validation Error Details
          </summary>
          <pre className='mt-2 text-xs text-red-700 overflow-auto'>
            {JSON.stringify(error.getFormattedErrors(), null, 2)}
          </pre>
        </details>
      )}

      {fallbackData && fallbackData.length > 0 && (
        <div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded'>
          <p className='text-yellow-800 text-sm font-medium'>
            ⚠️ Showing {fallbackData.length} partially validated items
          </p>
          <p className='text-yellow-700 text-xs mt-1'>
            Some data may be incomplete or invalid. Please refresh to get the latest data.
          </p>
        </div>
      )}
    </div>
  );
}; 