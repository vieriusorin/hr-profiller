import React,{ type ComponentType, type ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface WithErrorBoundaryOptions {
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  fallback?: ReactNode;
}

export const withErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  { FallbackComponent, fallback }: WithErrorBoundaryOptions = {}
) => {
  const WithErrorBoundary = (props: P) => {
    if (FallbackComponent) {
      return (
        <ErrorBoundary fallback={<FallbackComponent error={new Error()} resetErrorBoundary={() => { }} />}>
          <Component {...props} />
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  // Preserve the display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}; 