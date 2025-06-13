import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Opportunity Dashboard',
  description: 'Manage client opportunities and resource allocation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={outfit.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
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
      </body>
    </html>
  );
}
