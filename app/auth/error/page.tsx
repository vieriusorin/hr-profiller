'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const AuthErrorPage = () => {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You are not authorized to access this application.',
          details: 'Only users with @ddroidd.com email addresses are allowed to sign in. Please contact your administrator if you believe this is an error.'
        };
      case 'Signin':
        return {
          title: 'Sign In Error',
          description: 'There was a problem signing you in.',
          details: 'Please try again or contact support if the problem persists.'
        };
      case 'OAuthSignin':
        return {
          title: 'OAuth Error',
          description: 'Error in OAuth sign in flow.',
          details: 'There was an issue with the Microsoft authentication process.'
        };
      case 'OAuthCallback':
        return {
          title: 'Callback Error',
          description: 'Error in OAuth callback.',
          details: 'The authentication callback from Microsoft failed.'
        };
      case 'OAuthCreateAccount':
        return {
          title: 'Account Creation Error',
          description: 'Could not create account.',
          details: 'There was an issue creating your account.'
        };
      case 'EmailCreateAccount':
        return {
          title: 'Email Account Error',
          description: 'Could not create email account.',
          details: 'Email authentication is not available for this application.'
        };
      case 'Callback':
        return {
          title: 'Callback Error',
          description: 'Error in callback URL.',
          details: 'There was an issue with the authentication callback.'
        };
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Not Linked',
          description: 'OAuth account not linked.',
          details: 'This OAuth account is not linked to an existing user.'
        };
      case 'EmailSignin':
        return {
          title: 'Email Sign In Error',
          description: 'Error sending email.',
          details: 'Email authentication is not available for this application.'
        };
      case 'CredentialsSignin':
        return {
          title: 'Invalid Credentials',
          description: 'The credentials you provided are incorrect.',
          details: 'Please check your email and password and try again.'
        };
      case 'SessionRequired':
        return {
          title: 'Session Required',
          description: 'You must be signed in to access this page.',
          details: 'Please sign in with your @ddroidd.com Microsoft account.'
        };
      default:
        return {
          title: 'Authentication Error',
          description: 'An unknown error occurred during authentication.',
          details: 'Please try signing in again or contact support.'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='bg-red-600 rounded-full p-3'>
              <AlertTriangle className='h-8 w-8 text-white' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-gray-900'>Authentication Error</h1>
          <p className='text-gray-600 mt-2'>Something went wrong during sign in</p>
        </div>

        <Card className='shadow-lg border-0'>
          <CardHeader className='text-center pb-4'>
            <CardTitle className='text-xl font-semibold text-red-600'>
              {errorInfo.title}
            </CardTitle>
            <CardDescription>
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <p className='text-sm text-red-800'>
                {errorInfo.details}
              </p>
            </div>

            {error === 'AccessDenied' && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-start space-x-3'>
                  <Shield className='h-5 w-5 text-blue-600 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-blue-900'>Domain Restriction</h4>
                    <p className='text-sm text-blue-800 mt-1'>
                      This application is restricted to employees with @ddroidd.com email addresses. 
                      If you are a ddroidd.com employee and still cannot access, please contact IT support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className='space-y-3'>
              <Link href='/auth/signin'>
                <Button className='w-full bg-green-600 hover:bg-green-700 text-white'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Try Again
                </Button>
              </Link>
              
              <div className='text-center'>
                <p className='text-xs text-gray-500'>
                  Need help? Contact your system administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthErrorPage; 