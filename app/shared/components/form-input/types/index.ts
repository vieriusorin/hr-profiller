export interface FormInputProps {
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
