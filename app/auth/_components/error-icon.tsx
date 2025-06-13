import { AlertTriangle } from 'lucide-react';

export const ErrorIcon = () => {
  return (
    <div className='flex justify-center mb-4'>
      <div className='bg-red-600 rounded-full p-3'>
        <AlertTriangle className='h-8 w-8 text-white' />
      </div>
    </div>
  );
}; 