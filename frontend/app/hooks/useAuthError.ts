'use client';

import { useSearchParams } from 'next/navigation';

export interface ErrorInfo {
  title: string;
  description: string;
  details: string;
}

export const useAuthError = () => {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const getErrorMessage = (errorType: string | null): ErrorInfo => {
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

  return {
    error,
    errorInfo,
    isAccessDenied: error === 'AccessDenied'
  };
}; 