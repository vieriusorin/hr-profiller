'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignInFormData, UseSignInReturn } from '../types';
import { useSignInMutations } from './useSignInMutations';

const initialFormData: SignInFormData = {
  email: '',
  password: '',
};

const validateFormData = (data: SignInFormData): string | null => {
  if (!data.email || !data.password) {
    return 'Email and password are required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return 'Please enter a valid email address';
  }

  if (data.password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  return null;
};

export const useSignInForm = (): UseSignInReturn => {
  const [formData, setFormData] = useState<SignInFormData>(initialFormData);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl = rawCallbackUrl ? decodeURIComponent(rawCallbackUrl) : '/dashboard';
  
  const authError = searchParams.get('error');
  const [urlError, setUrlError] = useState<string | null>(null);
  
  const {
    credentialsMutation,
    microsoftMutation,
    error: mutationError,
    setError,
  } = useSignInMutations(callbackUrl);

  useEffect(() => {
    if (authError) {
      switch (authError) {
        case 'SessionRequired':
          setUrlError('Please sign in to access this page');
          break;
        case 'InvalidToken':
          setUrlError('Your session has expired. Please sign in again');
          break;
        case 'AccessDenied':
          setUrlError('Access denied. Please check your credentials');
          break;
        case 'CallbackError':
          setUrlError('An error occurred during sign in. Please try again');
          break;
        case 'InvalidDomain':
          setUrlError('Only @ddroidd.com email addresses are allowed');
          break;
        case 'InactiveAccount':
          setUrlError('Your account is inactive. Please contact support');
          break;
        default:
          setUrlError('An error occurred during sign in');
      }
    }
  }, [authError]);

  // Check if user is already signed in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          // If there's a callback URL, redirect there, otherwise go to dashboard
          const redirectUrl = callbackUrl !== '/dashboard' ? callbackUrl : '/dashboard';
          router.push(redirectUrl);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };
    checkSession();
  }, [router, callbackUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (validationError) {
      setValidationError(null);
    }
    if (mutationError) {
      setError(null);
    }
    if (urlError) {
      setUrlError(null);
    }
  };

  const handleCredentialsSignIn = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = validateFormData(formData);
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }
    
    setValidationError(null);
    credentialsMutation.mutate({
      email: formData.email.trim().toLowerCase(), // Normalize email
      password: formData.password,
    });
  }, [formData, credentialsMutation]);

  const handleMicrosoftSignIn = useCallback(() => {
    setValidationError(null);
    setUrlError(null);
    setError(null);
    
    microsoftMutation.mutate();
  }, [microsoftMutation, setError]);

  const setDemoAccount = useCallback((demoEmail: string, demoPassword: string) => {
    setFormData({
      email: demoEmail,
      password: demoPassword,
    });
    setValidationError(null);
    setUrlError(null);
    setError(null);
  }, [setError]);

  const combinedError = validationError || mutationError || urlError;
  const isLoading = credentialsMutation.isPending || microsoftMutation.isPending;

  return {
    formData,
    error: combinedError,
    isLoading,
    handleInputChange,
    handleCredentialsSignIn,
    handleMicrosoftSignIn,
    setDemoAccount,
    isCredentialsLoading: credentialsMutation.isPending,
    isMicrosoftLoading: microsoftMutation.isPending,
    callbackUrl,
    hasCallbackUrl: callbackUrl !== '/dashboard',
  };
}; 