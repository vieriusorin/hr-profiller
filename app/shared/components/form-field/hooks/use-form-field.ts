import React, { useCallback } from 'react';
import { FormFieldProps } from '../types';

export const useFormField = ({ value, onChange, type = 'text' }: Pick<FormFieldProps, 'value' | 'onChange' | 'type'>) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  }, [onChange, type]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    onChange(date);
  }, [onChange]);

  const inputValue = value ?? '';

  return {
    handleChange,
    handleDateChange,
    inputValue
  };
}; 
