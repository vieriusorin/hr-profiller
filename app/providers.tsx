'use client';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useState, ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, 
            gcTime: 1000 * 60 * 10,
            retry: (failureCount: number, error: Error) => {
              if (error instanceof Error && 'status' in error) {
                const status = (error as { status: number }).status;
                if (status >= 400 && status < 500) return false;
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
} 
