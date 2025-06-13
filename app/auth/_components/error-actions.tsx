import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const ErrorActions = () => {
  return (
    <div className='space-y-3'>
      <Link href='/auth/signin'>
        <Button className='w-full bg-yellow-600 hover:bg-yellow-700 text-white'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Try Again
        </Button>
      </Link>
      
      <div className='text-center'>
        <p className='text-xs text-gray-500'>
          Need help? Contact your system administrator.
        </p>
      </div>
    </div>
  );
}; 