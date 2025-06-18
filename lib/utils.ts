import { clsx, type ClassValue } from "clsx"
import { format, parseISO, isValid } from 'date-fns';
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCreatedDate = (dateString?: string) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Unknown';
    return format(date, 'MMM dd, yyyy');
  } catch {
    return 'Unknown';
  }
};