import React, { Component, type ReactNode, isValidElement } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by ErrorBoundary:', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // If fallback is a React element and has error and resetErrorBoundary props
      if (isValidElement(this.props.fallback) && 
          this.props.fallback.props &&
          typeof this.props.fallback.props === 'object' &&
          'error' in this.props.fallback.props && 
          'resetErrorBoundary' in this.props.fallback.props) {
        return React.cloneElement(this.props.fallback as React.ReactElement<{ error?: Error | null; resetErrorBoundary?: () => void }>, {
          error: this.state.error,
          resetErrorBoundary: this.handleRetry,
        });
      }

      // If fallback is provided but not a component with error props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className='flex flex-col items-center justify-center p-8 text-center'>
          <AlertCircle className='h-8 w-8 text-red-500 mb-4' />
          <h2 className='text-lg font-semibold mb-2'>Something went wrong</h2>
          <p className='text-sm text-gray-600 mb-4'>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={this.handleRetry}
            className='flex items-center gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
} 