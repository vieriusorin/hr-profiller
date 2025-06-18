'use client';

import { useState } from 'react';
import { SignUpFormData } from '../types';
import { useSignUp } from './useSignUp';

const initialFormData: SignUpFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

export const useSignUpForm = () => {
  const [formData, setFormData] = useState<SignUpFormData>(initialFormData);
  const [validationError, setValidationError] = useState<string>('');
  const signUp = useSignUp();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.email.endsWith('@ddroidd.com')) {
      setValidationError('Only @ddroidd.com email addresses are allowed');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!validateForm()) {
      return;
    }

    signUp.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  const error = validationError || signUp.error;

  return {
    formData,
    error,
    isLoading: signUp.isLoading,
    isSuccess: signUp.isSuccess,
    handleInputChange,
    handleSubmit,
  };
}; 