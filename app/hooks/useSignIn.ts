'use client';

import { signIn, getSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signIn('azure-ad', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      console.error('Microsoft sign in error:', error);
      setError('Microsoft sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Credentials sign in error:', error);
      setError('Sign in failed');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router]);

  const setDemoAccount = useCallback((demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  }, []);

  return {
    isLoading,
    email,
    password,
    error,
    setEmail,
    setPassword,
    setError,
    handleMicrosoftSignIn,
    handleCredentialsSignIn,
    setDemoAccount
  };
}; 