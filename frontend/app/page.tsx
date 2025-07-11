'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-emerald-100'>
      <Card className='w-full max-w-sm'>
        <CardContent className='flex flex-col items-center justify-center p-8 space-y-4'>
          <div className='bg-primary rounded-full p-4'>
            <Building2 className='h-8 w-8 text-white' />
          </div>
          <div className='text-center'>
            <h2 className='text-xl font-semibold text-gray-900'>DDROIDD</h2>
            <p className='text-sm text-gray-600 mt-1'>Loading...</p>
          </div>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
        </CardContent>
      </Card>
    </div>
  );
}
