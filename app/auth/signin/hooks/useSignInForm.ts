'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SignInFormData, UseSignInReturn } from '../types';
import { useSignInMutations } from './useSignInMutations';

const initialFormData: SignInFormData = {
  email: '',
  password: '',
};

export const useSignInForm = (): UseSignInReturn => {
  const [formData, setFormData] = useState<SignInFormData>(initialFormData);
  const router = useRouter();
  
  const {
    credentialsMutation,
    microsoftMutation,
    error,
    setError,
  } = useSignInMutations();

  // Check if user is already signed in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleCredentialsSignIn = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    credentialsMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  }, [formData.email, formData.password, credentialsMutation]);

  const handleMicrosoftSignIn = useCallback(() => {
    microsoftMutation.mutate();
  }, [microsoftMutation]);

  const setDemoAccount = useCallback((demoEmail: string, demoPassword: string) => {
    setFormData({
      email: demoEmail,
      password: demoPassword,
    });
    // Clear any existing errors
    setError(null);
  }, [setError]);

  const isLoading = credentialsMutation.isPending || microsoftMutation.isPending;

  return {
    formData,
    error,
    isLoading,
    handleInputChange,
    handleCredentialsSignIn,
    handleMicrosoftSignIn,
    setDemoAccount,
    isCredentialsLoading: credentialsMutation.isPending,
    isMicrosoftLoading: microsoftMutation.isPending,
  };
}; 