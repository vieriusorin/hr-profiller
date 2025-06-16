'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';
import { DemoAccounts } from './demo-accounts';
import { CredentialsFormProps } from './types';

export const CredentialsForm = ({
  email,
  password,
  isLoading,
  setEmail,
  setPassword,
  handleSubmit,
  setDemoAccount
}: CredentialsFormProps) => {
  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <div className='relative'>
          <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <Input
            id='email'
            type='email'
            placeholder='user@ddroidd.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='pl-10'
            required
          />
        </div>
      </div>
      
      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <div className='relative'>
          <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <Input
            id='password'
            type='password'
            placeholder='Enter your password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='pl-10'
            required
          />
        </div>
      </div>

      <Button 
        type='submit'
        disabled={isLoading}
        className='w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-md font-medium transition-colors'
      >
        {isLoading ? (
          <div className='flex items-center space-x-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            <span>Signing in...</span>
          </div>
        ) : (
          'Sign In'
        )}
      </Button>

      <DemoAccounts setDemoAccount={setDemoAccount} />
    </form>
  );
}; 