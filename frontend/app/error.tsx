'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='bg-red-50 border border-red-100 rounded-lg p-6'>
          <div className='flex flex-col items-center text-center space-y-4'>
            <div className='flex items-center justify-center w-12 h-12 rounded-full bg-red-100'>
              <AlertCircle className='h-6 w-6 text-red-600' />
            </div>
            
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-red-900'>
                Application Error
              </h3>
              <p className='text-sm text-red-700 max-w-md mx-auto'>
                {error.message || 'An unexpected error occurred. Our team has been notified.'}
              </p>
            </div>

            <div className='space-y-2'>
              <Button 
                onClick={reset}
                variant='outline'
                className='bg-white hover:bg-red-50 border-red-200 text-red-700 hover:text-red-800 flex items-center gap-2 mx-auto'
              >
                <RefreshCw className='h-4 w-4' />
                Try Again
              </Button>
              <p className='text-xs text-red-600'>
                If the problem persists, please contact support.
              </p>
              {error.digest && (
                <p className='text-xs text-red-600 mt-1'>
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 