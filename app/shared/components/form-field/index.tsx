'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { DatePicker } from '../date-picker';
import { FormFieldProps } from './types';
import { useFormField } from './hooks/use-form-field';

export const FormField = ({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  rows = 3,
}: FormFieldProps) => {
  const { handleChange, handleDateChange, inputValue } = useFormField({
    value,
    onChange,
    type,
  });

  return (
    <div className='space-y-2'>
      <Label className='text-sm font-medium'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </Label>

      {type === 'date' ? (
        <DatePicker
          value={value as Date | string | undefined}
          onChange={handleDateChange}
          placeholder={placeholder}
          disabled={disabled}
          error={!!error}
        />
      ) : type === 'textarea' ? (
        <Textarea
          value={inputValue as string}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={error ? 'border-red-500' : ''}
        />
      ) : (
        <Input
          type={type}
          value={inputValue as string | number}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          className={error ? 'border-red-500' : ''}
        />
      )}

      {error && (
        <div className='flex items-center gap-1 text-red-600 text-sm'>
          <AlertCircle className='h-3 w-3' />
          {error}
        </div>
      )}
    </div>
  );
}; 