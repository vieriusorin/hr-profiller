'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { DatePicker } from './date-picker';

interface FormFieldProps {
  label: string;
  value: string | number | Date | undefined;
  onChange: (value: string | number | Date | undefined) => void;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  rows?: number;
}

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
  rows = 3
}: FormFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  const handleDateChange = (date: Date | undefined) => {
    onChange(date);
  };

  const inputValue = value ?? '';

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