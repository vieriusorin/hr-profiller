'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSignUpForm } from './hooks/useSignUpForm';

const SignUpPage = () => {
  const {
    formData,
    error,
    isLoading,
    isSuccess,
    handleInputChange,
    handleSubmit,
  } = useSignUpForm();

  if (isSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col items-center justify-center p-8 space-y-4'>
            <div className='bg-primary rounded-full p-4'>
              <Building2 className='h-8 w-8 text-white' />
            </div>
            <div className='text-center'>
              <h2 className='text-xl font-semibold text-gray-900'>Account Created!</h2>
              <p className='text-sm text-gray-600 mt-1'>
                Redirecting to sign in page...
              </p>
            </div>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='bg-primary rounded-full p-3'>
              <Building2 className='h-8 w-8 text-white' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-gray-900'>Join DDROIDD</h1>
          <p className='text-gray-600 mt-2'>Create your account to get started</p>
        </div>

        <Card className='shadow-lg border-0'>
          <CardHeader className='text-center pb-4'>
            <CardTitle className='text-xl font-semibold'>Create Account</CardTitle>
            <CardDescription>
              Register with your ddroidd.com email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                  <p className='text-sm text-red-800'>{error}</p>
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    placeholder='John Doe'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='user@ddroidd.com'
                    value={formData.email}
                    onChange={handleInputChange}
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
                    name='password'
                    type='password'
                    placeholder='Enter your password'
                    value={formData.password}
                    onChange={handleInputChange}
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    placeholder='Confirm your password'
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className='pl-10'
                    required
                  />
                </div>
              </div>

              <Button 
                type='submit'
                disabled={isLoading}
                className='w-full bg-primary hover:bg-yellow-700 text-white py-3 rounded-md font-medium transition-colors'
              >
                {isLoading ? (
                  <div className='flex items-center space-x-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className='text-center'>
                <Link 
                  href='/auth/signin'
                  className='text-sm text-primary hover:text-yellow-700 flex items-center justify-center space-x-1'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>

            <div className='text-center mt-6'>
              <p className='text-xs text-gray-500'>
                Only employees with @ddroidd.com email addresses can register
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage; 
