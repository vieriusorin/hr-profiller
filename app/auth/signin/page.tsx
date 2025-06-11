'use client';

import { signIn, getSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Shield, Users, Mail, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { componentThemes } from '@/lib/theme';

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signIn('azure-ad', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      console.error('Microsoft sign in error:', error);
      setError('Microsoft sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Credentials sign in error:', error);
      setError('Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='bg-yellow-600 rounded-full p-3'>
              <Building2 className='h-8 w-8 text-white' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-gray-900'>Welcome to DDROIDD</h1>
          <p className='text-gray-600 mt-2'>Sign in to access your dashboard</p>
        </div>

        <Card className='shadow-lg border-0'>
          <CardHeader className='text-center pb-4'>
            <CardTitle className='text-xl font-semibold'>Sign In</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='credentials' className='space-y-4'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='credentials'>Email & Password</TabsTrigger>
                <TabsTrigger value='microsoft'>Microsoft</TabsTrigger>
              </TabsList>

              {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                  <p className='text-sm text-red-800'>{error}</p>
                </div>
              )}

              <TabsContent value='credentials'>
                <form onSubmit={handleCredentialsSignIn} className='space-y-4'>
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

                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                    <p className='text-sm text-yellow-800 font-semibold mb-3'>🧪 Demo Accounts for Testing:</p>
                    <div className='space-y-2 text-xs'>
                                              <div className='grid grid-cols-2 gap-2'>
                          <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
                            <p className='font-medium text-red-700'>👑 Admin</p>
                            <p className='text-yellow-800'>admin@ddroidd.com</p>
                            <p className='text-gray-600'>Full access + financials</p>
                          </div>
                          <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
                            <p className='font-medium text-blue-700'>👥 HR Manager</p>
                            <p className='text-yellow-800'>hr.manager@ddroidd.com</p>
                            <p className='text-gray-600'>HR without financials</p>
                          </div>
                        </div>
                      <div className='grid grid-cols-2 gap-2'>
                        <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
                          <p className='font-medium text-yellow-700'>🎯 Recruiter</p>
                          <p className='text-yellow-800'>recruiter@ddroidd.com</p>
                          <p className='text-gray-600'>Candidates only</p>
                        </div>
                        <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
                          <p className='font-medium text-purple-700'>👤 Employee</p>
                          <p className='text-yellow-800'>employee@ddroidd.com</p>
                          <p className='text-gray-600'>Basic project access</p>
                        </div>
                      </div>
                      <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
                        <p className='font-medium text-gray-700'>🔒 Basic User</p>
                        <p className='text-yellow-800'>user@ddroidd.com</p>
                        <p className='text-gray-600'>Dashboard only</p>
                      </div>
                      <div className='mt-3 pt-2 border-t border-yellow-300'>
                        <p className='text-yellow-700 font-medium mb-2'>All passwords: <code className='bg-yellow-100 px-1 rounded'>password123</code></p>
                        <div className='flex flex-wrap gap-1'>
                          <button
                            type='button'
                            onClick={() => {
                              setEmail('admin@ddroidd.com');
                              setPassword('password123');
                            }}
                            className='text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors'
                          >
                            Use Admin
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setEmail('hr.manager@ddroidd.com');
                              setPassword('password123');
                            }}
                            className='text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors'
                          >
                            Use HR
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setEmail('recruiter@ddroidd.com');
                              setPassword('password123');
                            }}
                            className='text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors'
                          >
                            Use Recruiter
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setEmail('employee@ddroidd.com');
                              setPassword('password123');
                            }}
                            className='text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded transition-colors'
                          >
                            Use Employee
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setEmail('user@ddroidd.com');
                              setPassword('password123');
                            }}
                            className='text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded transition-colors'
                          >
                            Use User
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value='microsoft'>
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
              </TabsContent>
            </Tabs>

            <div className='text-center mt-6 space-y-2'>
              <p className='text-xs text-gray-500'>
                Only employees with @ddroidd.com email addresses can access this system
              </p>
              <p className='text-sm text-gray-600'>
                Don't have an account?{' '}
                <Link href='/auth/signup' className='text-yellow-600 hover:text-yellow-700 font-medium'>
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className='text-center text-sm text-gray-500'>
          <p>Having trouble signing in? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage; 
