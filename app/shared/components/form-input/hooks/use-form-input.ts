import React from 'react';
import { FormInputProps } from '../types';

export const useFormInput = ({ onChange, type = 'text' }: Pick<FormInputProps, 'onChange' | 'type'>) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  return {
    handleChange,
  };
}; 
