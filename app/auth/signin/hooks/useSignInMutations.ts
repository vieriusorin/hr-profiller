'use client';

import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CredentialsSignInRequest } from '../types';

const credentialsSignInApi = async (data: CredentialsSignInRequest) => {
  const result = await signIn('credentials', {
    email: data.email,
    password: data.password,
    redirect: false,
  });

  if (result?.error) {
    throw new Error(result.error);
  }

  if (!result?.ok) {
    throw new Error('Sign in failed');
  }

  return result;
};

const microsoftSignInApi = async () => {
  const result = await signIn('azure-ad', { 
    callbackUrl: '/dashboard',
    redirect: true 
  });
  return result;
};

export const useSignInMutations = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const credentialsMutation = useMutation({
    mutationFn: credentialsSignInApi,
    onMutate: () => {
      setError(null);
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const microsoftMutation = useMutation({
    mutationFn: microsoftSignInApi,
    onMutate: () => {
      setError(null);
    },
    onError: (error: Error) => {
      console.error('Microsoft sign in error:', error);
      setError('Microsoft sign in failed');
    },
  });

  return {
    credentialsMutation,
    microsoftMutation,
    error,
    setError,
  };
}; 