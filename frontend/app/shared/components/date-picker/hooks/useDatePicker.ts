import { useCallback, useState } from 'react';
import { UseDatePickerParams } from '../types';

export const useDatePicker = ({ value, onChange }: UseDatePickerParams) => {
  const [open, setOpen] = useState(false);

  const dateValue = value instanceof Date ? value : (value ? new Date(value) : undefined);

  const handleSelect = useCallback((date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  }, [onChange]);

  return {
    open,
    setOpen,
    dateValue,
    handleSelect,
  };
}; 
