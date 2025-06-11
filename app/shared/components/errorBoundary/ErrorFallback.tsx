'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ErrorFallbackProps } from './types';

export const ErrorFallback = ({ error, resetError, retry }: ErrorFallbackProps) => {
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='max-w-md w-full text-center space-y-6'>
        <div className='flex justify-center'>
          <AlertTriangle className='h-16 w-16 text-red-500' />
        </div>
        
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Something went wrong
          </h1>
          <p className='text-gray-600'>
            We encountered an unexpected error. Don't worry, this won't affect your data.
          </p>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <p className='text-sm text-red-700 font-mono'>
              {error.message || 'Unknown error occurred'}
            </p>
          </div>
        )}

        <div className='space-y-3'>
          <Button 
            onClick={retry}
            className='w-full flex items-center justify-center gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Try Again
          </Button>
          
          <Button 
            variant='outline' 
            onClick={resetError}
            className='w-full'
          >
            Go Back
          </Button>
        </div>

        <p className='text-xs text-gray-500'>
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}; 
