export interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
} 

export type UseDatePickerParams = {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
}
