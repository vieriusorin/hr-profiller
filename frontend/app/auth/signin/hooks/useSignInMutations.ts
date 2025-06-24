'use client';

import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { CredentialsSignInRequest } from '../types';

const credentialsSignInApi = async (data: CredentialsSignInRequest, callbackUrl: string) => {
  const result = await signIn('credentials', {
    ...data,
    callbackUrl,
    redirect: false,
  });

  if (result?.error) {
    switch (result.error) {
      case 'CredentialsSignin':
        throw new Error('Invalid email or password');
      case 'AccessDenied':
        throw new Error('Access denied. Please check your credentials');
      case 'CallbackError':
        throw new Error('Authentication failed. Please try again');
      default:
        throw new Error(result.error);
    }
  }

  if (!result?.ok) {
    throw new Error('Sign in failed. Please try again');
  }

  if (result.ok && callbackUrl) {
    window.location.href = callbackUrl;
  }

  return result;
};

const microsoftSignInApi = async (callbackUrl: string) => {
  const result = await signIn('azure-ad', { 
    callbackUrl,
    redirect: false,
  });
  
  if (result?.url) {
    window.location.href = result.url;
  }
  
  return result;
};

export const useSignInMutations = (callbackUrl: string) => {
  const [error, setError] = useState<string | null>(null);

  const credentialsMutation = useMutation({
    mutationFn: (data: CredentialsSignInRequest) => credentialsSignInApi(data, callbackUrl),
    onMutate: () => {
      setError(null);
    },
    onError: (error: Error) => {
      console.error('Credentials sign in error:', error);
      setError(error.message);
    },
    onSuccess: () => {
      setError(null);
    },
  });

  const microsoftMutation = useMutation({
    mutationFn: () => microsoftSignInApi(callbackUrl),
    onMutate: () => {
      setError(null);
    },
    onError: (error: Error) => {
      console.error('Microsoft sign in error:', error);
      setError('Microsoft sign in failed. Please try again');
    },
  });

  return {
    credentialsMutation,
    microsoftMutation,
    error,
    setError,
  };
}; 