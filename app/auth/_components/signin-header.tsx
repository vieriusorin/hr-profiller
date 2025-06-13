import { Building2 } from 'lucide-react';

export const SignInHeader = () => {
  return (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <div className='bg-yellow-600 rounded-full p-3'>
          <Building2 className='h-8 w-8 text-white' />
        </div>
      </div>
      <h1 className='text-3xl font-bold text-gray-900'>Welcome to DDROIDD</h1>
      <p className='text-gray-600 mt-2'>Sign in to access your dashboard</p>
    </div>
  );
}; 