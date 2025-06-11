'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { FormInputProps } from './types';
import { useFormInput } from './hooks/use-form-input';

export const FormInput = ({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required,
  min,
  max
}: FormInputProps) => {
  const { handleChange } = useFormInput({ onChange, type });

  return (
    <div className='space-y-2'>
      <Label className='text-sm font-medium'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <div className='flex items-center gap-1 text-red-600 text-sm'>
          <AlertCircle className='h-3 w-3' />
          {error}
        </div>
      )}
    </div>
  );
}; 