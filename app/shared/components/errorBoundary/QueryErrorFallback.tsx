'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryErrorFallbackProps } from './types';

export const QueryErrorFallback = ({ error, reset, queryKey }: QueryErrorFallbackProps) => {
  const queryClient = useQueryClient();

  const handleRetry = () => {
    if (queryKey) {
      queryClient.invalidateQueries({ queryKey });
    } else {
      queryClient.invalidateQueries();
    }
    if (reset) reset();
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  return (
    <div className='p-8 text-center space-y-6 bg-red-50 border border-red-200 rounded-lg'>
      <div className='flex justify-center'>
        <AlertTriangle className='h-12 w-12 text-red-500' />
      </div>
      
      <div className='space-y-2'>
        <h2 className='text-xl font-semibold text-gray-900'>
          Failed to Load Data
        </h2>
        <p className='text-gray-600'>
          There was a problem loading the information. Please try again.
        </p>
      </div>

      <div className='bg-red-100 border border-red-300 rounded p-3'>
        <p className='text-sm text-red-700 font-mono'>
          {error.message || 'Network error occurred'}
        </p>
      </div>

      <div className='space-y-3'>
        <Button 
          onClick={handleRetry}
          className='flex items-center justify-center gap-2'
          variant='default'
        >
          <RefreshCw className='h-4 w-4' />
          Retry
        </Button>
        
        <Button 
          variant='outline' 
          onClick={handleRefreshPage}
          size='sm'
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
}; 