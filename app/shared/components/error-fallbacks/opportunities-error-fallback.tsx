'use client';
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OpportunitiesErrorFallbackProps } from './types';

export const OpportunitiesErrorFallback = ({
  error,
  resetErrorBoundary,
}: OpportunitiesErrorFallbackProps) => {
  const getErrorMessage = (error: Error) => {
    // Check if it's a server error (500)
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'The server encountered an unexpected condition. Our team has been notified and is working on it. Please try again in a few minutes.';
    }

    // Check for specific API endpoint failures
    if (error.message.includes('Failed to fetch completed opportunities')) {
      return 'Unable to load completed opportunities. This might be due to a network issue or the server being temporarily unavailable.';
    }
    if (error.message.includes('Failed to fetch in-progress opportunities')) {
      return 'Unable to load in-progress opportunities. This might be due to a network issue or the server being temporarily unavailable.';
    }
    if (error.message.includes('Failed to fetch on-hold opportunities')) {
      return 'Unable to load on-hold opportunities. This might be due to a network issue or the server being temporarily unavailable.';
    }

    // Network error
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Default error message
    return 'There was a problem loading the opportunities. This might be due to a network issue or the server being temporarily unavailable.';
  };

  const getErrorTitle = (error: Error) => {
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'Server Error';
    }
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Connection Error';
    }
    return 'Unable to Load Opportunities';
  };

  const getSupportText = (error: Error) => {
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'Our team has been automatically notified. Please try again later.';
    }
    return 'If the problem persists, please contact support.';
  };

  return (
    <Card className='p-6 bg-red-50 border-red-100'>
      <div className='flex flex-col items-center text-center space-y-4'>
        <div className='flex items-center justify-center w-12 h-12 rounded-full bg-red-100'>
          <AlertCircle className='h-6 w-6 text-red-600' />
        </div>
        
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold text-red-900'>
            {getErrorTitle(error)}
          </h3>
          <p className='text-sm text-red-700 max-w-md mx-auto'>
            {getErrorMessage(error)}
          </p>
        </div>

        <div className='space-y-2'>
          <Button 
            onClick={resetErrorBoundary}
            variant='outline'
            className='bg-white hover:bg-red-50 border-red-200 text-red-700 hover:text-red-800 flex items-center gap-2 mx-auto'
          >
            <RefreshCw className='h-4 w-4' />
            Try Again
          </Button>
          <p className='text-xs text-red-600'>
            {getSupportText(error)}
          </p>
          {(error.message.includes('500') || error.message.includes('Internal Server Error')) && (
            <p className='text-xs text-red-600 mt-1'>
              Error Code: 500 - Internal Server Error
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}; 