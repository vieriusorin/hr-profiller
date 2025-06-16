'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './providers/theme-provider';
import type { Settings } from '@/lib/settings';

export function Providers({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: Settings;
}) {
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
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <NuqsAdapter>
            {children}
            <Toaster
              position='top-right'
              toastOptions={{
                duration: 4000,
                style: {
                  background: settings.primaryColor,
                  color: settings.primaryForeground,
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </NuqsAdapter>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
} 