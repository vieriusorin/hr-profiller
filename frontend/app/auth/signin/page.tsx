'use client';

import { SignInHeader } from '@/app/auth/_components/signin-header';
import { SignInCard } from '@/app/auth/_components/signin-card';
import { useSignInForm } from './hooks';

const SignInPage = () => {
  const {
    formData,
    error,
    isLoading,
    handleInputChange,
    handleCredentialsSignIn,
    handleMicrosoftSignIn,
    setDemoAccount
  } = useSignInForm();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 p-4'>
      <div className='w-full max-w-md space-y-8'>
        <SignInHeader />
        <SignInCard
          email={formData.email}
          password={formData.password}
          error={error || ''}
          isLoading={isLoading}
          setEmail={(email) => handleInputChange({ target: { name: 'email', value: email } } as React.ChangeEvent<HTMLInputElement>)}
          setPassword={(password) => handleInputChange({ target: { name: 'password', value: password } } as React.ChangeEvent<HTMLInputElement>)}
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
