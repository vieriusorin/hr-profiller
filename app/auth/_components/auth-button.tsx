'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';

export const AuthButton = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Button disabled variant='outline'>
        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-green-600'></div>
      </Button>
    );
  }

  if (session) {
    return (
      <div className='flex items-center space-x-3'>
        <div className='flex items-center space-x-2 text-sm text-gray-600'>
          <User className='h-4 w-4' />
          <span>{session.user?.name || session.user?.email}</span>
        </div>
        <Button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          variant='outline'
          size='sm'
          className='flex items-center space-x-2'
        >
          <LogOut className='h-4 w-4' />
          <span>Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn('azure-ad', { callbackUrl: '/dashboard' })}
      className='flex items-center space-x-2'
    >
      <LogIn className='h-4 w-4' />
      <span>Sign In</span>
    </Button>
  );
}; 
