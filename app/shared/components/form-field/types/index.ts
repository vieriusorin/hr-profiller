export interface FormFieldProps {
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
