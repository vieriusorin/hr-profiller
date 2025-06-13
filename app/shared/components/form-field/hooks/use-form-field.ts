import React from 'react';
import { FormFieldProps } from '../types';

export const useFormField = ({ value, onChange, type = 'text' }: Pick<FormFieldProps, 'value' | 'onChange' | 'type'>) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  const handleDateChange = (date: Date | undefined) => {
    onChange(date);
  };

  const inputValue = value ?? '';

  return {
    handleChange,
    handleDateChange,
    inputValue
  };
}; 
