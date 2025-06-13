'use client';

import { useAuthError } from '@/app/hooks/useAuthError';
import { ErrorHeader } from '@/app/auth/_components/error-header';
import { ErrorCard } from '@/app/auth/_components/error-card';

const AuthErrorPage = () => {
  const { errorInfo, isAccessDenied } = useAuthError();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4'>
      <div className='w-full max-w-md space-y-8'>
        <ErrorHeader />
        <ErrorCard errorInfo={errorInfo} isAccessDenied={isAccessDenied} />
      </div>
    </div>
  );
};

export default AuthErrorPage; 
