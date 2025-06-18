'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SignUpRequest, SignUpResponse, UseSignUpReturn } from '../types';

const signUpApi = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Sign up failed');
  }

  return result;
};

export const useSignUp = (): UseSignUpReturn => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: signUpApi,
    onMutate: () => {
      setError(null);
    },
    onSuccess: () => {
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error,
  };
}; 