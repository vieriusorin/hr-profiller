import { ReactNode } from 'react';

// Error boundary props
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

// Error boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Error fallback component props
export interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  retry: () => void;
}

// Query-specific error fallback props
export interface QueryErrorFallbackProps {
  error: Error;
  reset?: () => void;
  queryKey?: readonly unknown[];
}

// Error info type from React
export interface ErrorInfo {
  componentStack: string;
} 