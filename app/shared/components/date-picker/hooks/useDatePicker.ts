import { useState } from 'react';

interface UseDatePickerParams {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
}

export const useDatePicker = ({ value, onChange }: UseDatePickerParams) => {
  const [open, setOpen] = useState(false);

  const dateValue = value instanceof Date ? value : (value ? new Date(value) : undefined);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  return {
    open,
    setOpen,
    dateValue,
    handleSelect,
  };
}; 
