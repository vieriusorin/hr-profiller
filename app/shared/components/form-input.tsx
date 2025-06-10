'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

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
}: FormInputProps) => (
  <div className='space-y-2'>
    <Label className='text-sm font-medium'>
      {label}
      {required && <span className='text-red-500 ml-1'>*</span>}
    </Label>
    <Input
      type={type}
      value={value}
      onChange={(e) => {
        const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
        onChange(newValue);
      }}
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