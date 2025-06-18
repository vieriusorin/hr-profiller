import { Button } from '@/components/ui/button';
import { Shield, Users } from 'lucide-react';
import { MicrosoftSignInProps } from './types';

export const MicrosoftSignIn = ({ isLoading, handleMicrosoftSignIn }: MicrosoftSignInProps) => {
  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <div className='flex items-center space-x-3 text-sm text-gray-600'>
          <Shield className='h-4 w-4 text-yellow-600' />
          <span>Secure authentication with Microsoft</span>
        </div>
        <div className='flex items-center space-x-3 text-sm text-gray-600'>
          <Users className='h-4 w-4 text-yellow-600' />
          <span>Restricted to @ddroidd.com domain</span>
        </div>
      </div>

      <Button 
        onClick={handleMicrosoftSignIn}
        disabled={isLoading}
        className='w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-md font-medium transition-colors'
      >
        {isLoading ? (
          <div className='flex items-center space-x-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            <span>Signing in...</span>
          </div>
        ) : (
          <div className='flex items-center space-x-2'>
            <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z'/>
            </svg>
            <span>Sign in with Microsoft</span>
          </div>
        )}
      </Button>

      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
        <p className='text-sm text-yellow-800'>
          Microsoft authentication requires Azure AD configuration.
          Use the Email & Password tab for demo purposes.
        </p>
      </div>
    </div>
  );
}; 