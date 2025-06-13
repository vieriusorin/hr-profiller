'use client';

import { useSignIn } from '@/app/hooks/useSignIn';
import { SignInHeader } from '@/app/auth/_components/signin-header';
import { SignInCard } from '@/app/auth/_components/signin-card';

const SignInPage = () => {
  const {
    isLoading,
    email,
    password,
    error,
    setEmail,
    setPassword,
    handleMicrosoftSignIn,
    handleCredentialsSignIn,
    setDemoAccount
  } = useSignIn();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 p-4'>
      <div className='w-full max-w-md space-y-8'>
        <SignInHeader />
        <SignInCard
          email={email}
          password={password}
          error={error}
          isLoading={isLoading}
          setEmail={setEmail}
          setPassword={setPassword}
          handleCredentialsSignIn={handleCredentialsSignIn}
          handleMicrosoftSignIn={handleMicrosoftSignIn}
          setDemoAccount={setDemoAccount}
        />
        <div className='text-center text-sm text-gray-500'>
          <p>Having trouble signing in? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage; 
