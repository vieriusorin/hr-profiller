import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const OpportunityCardSkeleton = () => {
  return (
    <div className='p-4 border rounded-lg shadow-sm bg-white'>
      <div className='flex justify-between items-start'>
        <div className='flex-grow'>
          <Skeleton className='h-6 w-3/4 mb-2' />
          <Skeleton className='h-4 w-1/2' />
        </div>
        <div className='flex-shrink-0 ml-4'>
          <Skeleton className='h-8 w-24' />
        </div>
      </div>
      <div className='mt-4 pt-4 border-t'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-5 w-20' />
          <Skeleton className='h-5 w-20' />
          <Skeleton className='h-5 w-20' />
        </div>
        <div className='mt-4 space-y-3'>
          <div className='flex items-center justify-between p-2 rounded-md'>
            <div className='flex-1'>
              <Skeleton className='h-5 w-1/3' />
            </div>
            <div className='w-24 text-center'>
              <Skeleton className='h-5 w-full' />
            </div>
            <div className='w-24 text-center'>
              <Skeleton className='h-5 w-full' />
            </div>
            <div className='w-32 flex justify-end'>
              <Skeleton className='h-8 w-24' />
            </div>
          </div>
          <div className='flex items-center justify-between p-2 rounded-md'>
            <div className='flex-1'>
              <Skeleton className='h-5 w-1/3' />
            </div>
            <div className='w-24 text-center'>
              <Skeleton className='h-5 w-full' />
            </div>
            <div className='w-24 text-center'>
              <Skeleton className='h-5 w-full' />
            </div>
            <div className='w-32 flex justify-end'>
              <Skeleton className='h-8 w-24' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 