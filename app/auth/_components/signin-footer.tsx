import Link from 'next/link';

export const SignInFooter = () => {
  return (
    <>
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
      
      <div className='text-center text-sm text-gray-500'>
        <p>Having trouble signing in? Contact your administrator.</p>
      </div>
    </>
  );
}; 